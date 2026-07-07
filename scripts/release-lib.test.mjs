import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  markReleasedVersions,
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
