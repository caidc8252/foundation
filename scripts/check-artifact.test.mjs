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

test("check-artifact flags .table-frame--flush nested in a .card (advisory, no exit-code change)", () => {
  const dir = mkdtempSync(join(tmpdir(), "foundation-artifact-"));
  try {
    // BAD: card > card__content--flush > table-frame--flush — two frame mechanisms
    // fight; the card's overflow:hidden traps the sticky header --flush exists to free.
    const bad = join(dir, "bad-flush-nesting.html");
    writeFileSync(
      bad,
      `<!doctype html>
<div class="card">
  <div class="card__content card__content--flush">
    <div class="table-frame table-frame--flush">
      <div class="table-scroll"><table class="data-table"></table></div>
    </div>
  </div>
</div>
`,
      "utf8",
    );
    // GOOD: the list results card IS a standalone .table-frame--flush (no .card),
    // and a plain table in a section card uses .table-frame (no --flush).
    const good = join(dir, "good-flush.html");
    writeFileSync(
      good,
      `<!doctype html>
<div class="table-frame table-frame--flush">
  <div class="table-scroll"><table class="data-table data-table--sticky-head"></table></div>
</div>
<div class="card">
  <div class="card__content card__content--flush">
    <div class="table-frame"><table class="data-table"></table></div>
  </div>
</div>
`,
      "utf8",
    );

    const bin = join(root, "scripts", "check-artifact.mjs");
    const runBad = spawnSync(process.execPath, [bin, bad], { cwd: root, encoding: "utf8" });
    const runGood = spawnSync(process.execPath, [bin, good], { cwd: root, encoding: "utf8" });

    // Advisory only: it surfaces the nesting but must NOT fail the build.
    assert.equal(runBad.status, 0, runBad.stdout);
    assert.match(runBad.stdout, /table-frame--flush inside a \.card/i);
    // The clean structures raise no such advisory.
    assert.equal(runGood.status, 0, runGood.stdout);
    assert.doesNotMatch(runGood.stdout, /table-frame--flush inside a \.card/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
