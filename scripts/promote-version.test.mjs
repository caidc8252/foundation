import assert from "node:assert/strict";
import { rmSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const version = "v900001";
const versionDir = join(root, "versions", version);

test("promote brief includes mandatory cloud-next-scaffold UI sync task", () => {
  rmSync(versionDir, { recursive: true, force: true });
  mkdirSync(versionDir, { recursive: true });
  try {
    writeFileSync(
      join(versionDir, "manifest.json"),
      `${JSON.stringify(
        {
          version,
          source: {
            page: "settings.html",
            title: "Settings",
            href: "http://localhost:4177/settings.html",
          },
          publishedAt: "2026-06-30T00:00:00.000Z",
          tokenOverrides: {
            "--color-primary-700": "oklch(30% 0.07 262)",
          },
          classOverrides: {
            ".list-row": {
              "padding-block": "var(--space-4)",
            },
          },
          classOverrideMeta: {
            ".list-row": {
              "padding-block": {
                ownerLayer: "composite",
                ownerName: "list-row",
                ownerTitle: "List row",
                ownerClass: ".list-row",
              },
            },
          },
          changes: {
            tokens: [
              {
                name: "--color-primary-700",
                previous: "oklch(24% 0.06 262)",
                next: "oklch(30% 0.07 262)",
              },
            ],
            composites: [
              {
                selector: ".list-row",
                prop: "padding-block",
                previous: "var(--space-3)",
                next: "var(--space-4)",
                owner: {
                  ownerLayer: "composite",
                  ownerName: "list-row",
                  ownerTitle: "List row",
                  ownerClass: ".list-row",
                },
              },
            ],
          },
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const run = spawnSync(
      process.execPath,
      [join(root, "scripts", "promote-version.mjs"), version, "--stdout"],
      { cwd: root, encoding: "utf8" },
    );

    assert.equal(run.status, 0, run.stderr || run.stdout);
    assert.match(run.stdout, /cloud-next-scaffold UI sync/i);
    assert.match(run.stdout, /packages\/ui\/src\/components\/ui\/recipes\/list-row\.tsx/);
    assert.match(run.stdout, /currently has no known @cloud\/ui implementation/i);
    assert.match(run.stdout, /packages\/ui\/src\/components\/styles\/index\.css/);
    assert.match(run.stdout, /Create two PRs/i);
    assert.match(run.stdout, /Foundation PR/i);
    assert.match(run.stdout, /cloud-next-scaffold UI PR/i);
  } finally {
    rmSync(versionDir, { recursive: true, force: true });
  }
});
