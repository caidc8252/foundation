import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  markReleasedVersions,
  normalizePrototypeApiPath,
  normalizeReviewSubject,
  prototypeCorsHeaders,
  readReleaseInfo,
} from "./publish-server.mjs";

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

test("prototype agent API keeps legacy routes behind stable frontend paths", () => {
  assert.equal(normalizePrototypeApiPath("/api/prototype/health"), "/api/prototype/health");
  assert.equal(normalizePrototypeApiPath("/api/prototype/versions"), "/__prototype_versions");
  assert.equal(normalizePrototypeApiPath("/api/prototype/save"), "/__prototype_save");
  assert.equal(normalizePrototypeApiPath("/api/prototype/finalize"), "/__prototype_finalize");
  assert.equal(normalizePrototypeApiPath("/api/prototype/promote"), "/__prototype_promote");
  assert.equal(normalizePrototypeApiPath("/api/prototype/release"), "/__prototype_release");
  assert.equal(normalizePrototypeApiPath("/__prototype_versions"), "/__prototype_versions");
});

test("prototype agent CORS headers allow GitHub Pages to call the local service", () => {
  assert.deepEqual(prototypeCorsHeaders(), {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-private-network": "true",
  });
});
