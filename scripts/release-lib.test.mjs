import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { markReleasedVersions, readReleaseInfo } from "./release-lib.mjs";

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
