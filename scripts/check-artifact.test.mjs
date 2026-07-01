import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("check-artifact rejects cell-tags on table cells", () => {
  const dir = mkdtempSync(join(tmpdir(), "foundation-artifact-"));
  try {
    const file = join(dir, "bad-cell-tags.html");
    writeFileSync(
      file,
      `<!doctype html>
<table class="data-table">
  <tbody>
    <tr>
      <td class="cell-tags"><span class="badge">ISO</span></td>
    </tr>
  </tbody>
</table>
`,
      "utf8",
    );

    const run = spawnSync(
      process.execPath,
      [join(root, "scripts", "check-artifact.mjs"), "--strict", file],
      { cwd: root, encoding: "utf8" },
    );

    assert.notEqual(run.status, 0, run.stdout);
    assert.match(run.stdout, /cell-tags/i);
    assert.match(run.stdout, /table cell/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
