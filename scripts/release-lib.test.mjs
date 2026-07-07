import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  assertFinalizeOverrides,
  markReleasedVersions,
  normalizeElementOverrides,
  normalizeReviewSubject,
  pendingReleaseSummary,
  readReleaseInfo,
} from "./release-lib.mjs";

test("readReleaseInfo reads the currently published version from release manifest", () => {
  const dir = mkdtempSync(join(tmpdir(), "foundation-release-"));
  try {
    writeFileSync(
      join(dir, "manifest.json"),
      `${JSON.stringify(
        {
          version: "v1",
          releasedAt: "2026-06-30T00:51:34.649Z",
          release: {
            version: "v3",
          },
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    assert.deepEqual(readReleaseInfo(dir), {
      version: "v3",
      releasedAt: "2026-06-30T00:51:34.649Z",
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("markReleasedVersions marks only the version currently in release", () => {
  const versions = markReleasedVersions(
    [
      { version: "v1", status: "clean" },
      { version: "v2", status: "clean" },
    ],
    {
      version: "v2",
      releasedAt: "2026-06-30T00:51:34.649Z",
    },
  );

  assert.equal(versions[0].released, false);
  assert.equal(versions[0].releasedAt, "");
  assert.equal(versions[1].released, true);
  assert.equal(versions[1].releasedAt, "2026-06-30T00:51:34.649Z");
});

test("pendingReleaseSummary flags a clean version newer than the released one", () => {
  const releaseInfo = { version: "v1", releasedAt: "2026-06-30T00:51:34.649Z" };
  const versions = markReleasedVersions(
    [
      { version: "v1", status: "clean", releaseable: true },
      { version: "v2", status: "clean", releaseable: true },
    ],
    releaseInfo,
  );
  const summary = pendingReleaseSummary(versions, releaseInfo);

  assert.equal(summary.releasedVersion, "v1");
  assert.deepEqual(summary.pending, ["v2"]);
  assert.equal(summary.hasPending, true);
  assert.equal(summary.next, "v2");
  assert.equal(summary.latestReleaseable, "v2");
});

test("pendingReleaseSummary is quiet when the released version is the latest releaseable", () => {
  const releaseInfo = { version: "v2", releasedAt: "2026-07-07T04:03:56.343Z" };
  const versions = markReleasedVersions(
    [
      { version: "v1", status: "clean", releaseable: true },
      { version: "v2", status: "clean", releaseable: true },
    ],
    releaseInfo,
  );
  const summary = pendingReleaseSummary(versions, releaseInfo);

  // v1 is older than the released v2 → not pending (superseded, not forgotten).
  assert.deepEqual(summary.pending, []);
  assert.equal(summary.hasPending, false);
  assert.equal(summary.next, "");
});

test("pendingReleaseSummary ignores newer versions that are not yet releaseable", () => {
  const releaseInfo = { version: "v1", releasedAt: "2026-06-30T00:51:34.649Z" };
  const versions = markReleasedVersions(
    [
      { version: "v1", status: "clean", releaseable: true },
      { version: "v2", status: "draft", releaseable: false },
    ],
    releaseInfo,
  );
  const summary = pendingReleaseSummary(versions, releaseInfo);

  // v2 still has unpromoted overrides → not a forgotten release, needs promote first.
  assert.deepEqual(summary.pending, []);
  assert.equal(summary.hasPending, false);
});

test("normalizeReviewSubject keeps only safe visible review target fields", () => {
  assert.deepEqual(
    normalizeReviewSubject({
      label: "客户列表里的表格",
      visualName: "表格",
      selector: ".data-table",
      className: "data-table",
      sourceFile: "composites/composites.css",
      owner: {
        layer: "composite",
        name: "data-table",
        title: "Data table",
        injected: "drop me",
      },
      injected: "drop me",
    }),
    {
      label: "客户列表里的表格",
      visualName: "表格",
      selector: ".data-table",
      className: "data-table",
      sourceFile: "composites/composites.css",
      owner: {
        layer: "composite",
        name: "data-table",
        title: "Data table",
      },
    },
  );

  assert.equal(normalizeReviewSubject({ selector: "body", sourceFile: "release/composites.css" }), null);
});

test("normalizeElementOverrides (foundation) keeps composite identity + composite#path key", () => {
  const out = normalizeElementOverrides({
    any: { composite: "page-header", rootClass: ".page-header", path: "2.0", classSwaps: { variant: { from: "btn--secondary", to: "btn--primary" } } },
  });
  assert.deepEqual(Object.keys(out), ["page-header#2.0"]);
  assert.equal(out["page-header#2.0"].rootClass, ".page-header");
});

test("assertFinalizeOverrides throws when there are no token/class/element overrides", () => {
  assert.throws(
    () =>
      assertFinalizeOverrides("v9", {
        tokenOverrideCount: 0,
        classOverrideDeclarations: 0,
        elementOverrideCount: 0,
        report: null,
      }),
    /no draft overrides/,
  );
});

test("assertFinalizeOverrides throws when element overrides exist but materialize has not been run", () => {
  assert.throws(
    () =>
      assertFinalizeOverrides("v9", {
        tokenOverrideCount: 0,
        classOverrideDeclarations: 0,
        elementOverrideCount: 1,
        report: null,
      }),
    /materialize/i,
  );
});

test("assertFinalizeOverrides gates on unfinished contract TODOs even when materialize's stats.changed is 0 (idempotent re-run)", () => {
  const report = {
    stats: { changed: 0 },
    contractTodos: [{ composite: "page-header", file: "composites/page-header.md", done: false }],
  };
  assert.throws(
    () =>
      assertFinalizeOverrides("v9", {
        tokenOverrideCount: 0,
        classOverrideDeclarations: 0,
        elementOverrideCount: 1,
        report,
      }),
    /contract/i,
  );

  try {
    assertFinalizeOverrides("v9", {
      tokenOverrideCount: 0,
      classOverrideDeclarations: 0,
      elementOverrideCount: 1,
      report,
    });
    assert.fail("expected assertFinalizeOverrides to throw");
  } catch (err) {
    assert.match(err.message, /composites\/page-header\.md/);
  }
});

test("assertFinalizeOverrides allows a materialized-only version once all contract TODOs are done, even with stats.changed:0", () => {
  assert.doesNotThrow(() =>
    assertFinalizeOverrides("v9", {
      tokenOverrideCount: 0,
      classOverrideDeclarations: 0,
      elementOverrideCount: 1,
      report: {
        stats: { changed: 0 },
        contractTodos: [{ composite: "page-header", file: "composites/page-header.md", done: true }],
      },
    }),
  );
});

test("assertFinalizeOverrides allows the existing token-override path regardless of report state", () => {
  assert.doesNotThrow(() =>
    assertFinalizeOverrides("v9", {
      tokenOverrideCount: 1,
      classOverrideDeclarations: 0,
      elementOverrideCount: 0,
      report: null,
    }),
  );
});
