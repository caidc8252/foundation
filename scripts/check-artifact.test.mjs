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

test("check-artifact catches a JS-templated off-set class, but not interpolated values (--strict)", () => {
  const dir = mkdtempSync(join(tmpdir(), "foundation-artifact-"));
  try {
    const file = join(dir, "offset-js.html");
    writeFileSync(
      file,
      `<!doctype html>
<table class="data-table"><tbody id="tb"></tbody></table>
<script>
  var tone = 'badge--neutral';
  document.getElementById('tb').innerHTML =
    '<tr><td><span class="badge ' + tone + '">A</span></td>' +
    '<td><span class="totally-not-a-foundation-class">B</span></td></tr>';
</script>
`,
      "utf8",
    );

    const run = spawnSync(
      process.execPath,
      [join(root, "scripts", "check-artifact.mjs"), "--strict", file],
      { cwd: root, encoding: "utf8" },
    );

    // The clean literal off-set class is caught…
    assert.notEqual(run.status, 0, run.stdout);
    assert.match(run.stdout, /totally-not-a-foundation-class/);
    // …but the interpolated value must NOT leak junk tokens (the JS var / operators).
    assert.doesNotMatch(run.stdout, /\btone\b/);
    assert.doesNotMatch(run.stdout, /'\s*\+/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("check-artifact rejects cell-tags on a <td> built by a JS template (in <script>)", () => {
  const dir = mkdtempSync(join(tmpdir(), "foundation-artifact-"));
  try {
    // A mock-data prototype renders rows from JS strings; the offending cell lives
    // inside <script>, which the markup scan strips. The structural check must scan
    // the raw html so this is still caught (hard violation).
    const file = join(dir, "bad-cell-tags-js.html");
    writeFileSync(
      file,
      `<!doctype html>
<table class="data-table"><tbody id="tb"></tbody></table>
<script>
  document.getElementById('tb').innerHTML =
    '<tr><td class="cell-tags"><span class="badge">ISO</span></td></tr>';
</script>
`,
      "utf8",
    );

    const run = spawnSync(
      process.execPath,
      [join(root, "scripts", "check-artifact.mjs"), file],
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

test("check-artifact flags search/filter wired on change (principle 14, advisory)", () => {
  const dir = mkdtempSync(join(tmpdir(), "foundation-artifact-"));
  try {
    // BAD: search input runs the query on every keystroke (search-as-you-type).
    const bad = join(dir, "bad-search-on-change.html");
    writeFileSync(
      bad,
      `<!doctype html>
<div class="search-input"><input class="input" id="q-input" type="search"></div>
<button id="q-search" class="btn btn--secondary" type="button">Search</button>
<script>
  function byId(x){ return document.getElementById(x); }
  function commitSearch(){ renderList(); }
  byId('q-input').addEventListener('input', commitSearch);
</script>
`,
      "utf8",
    );
    // GOOD: commits only on the Search button (click) and Enter (keydown) — the
    // draft→applied model. keydown/keyup are not on-change and must not be flagged.
    const good = join(dir, "good-search.html");
    writeFileSync(
      good,
      `<!doctype html>
<div class="search-input"><input class="input" id="q-input" type="search"></div>
<button id="q-search" class="btn btn--secondary" type="button">Search</button>
<script>
  function byId(x){ return document.getElementById(x); }
  function commitSearch(){ renderList(); }
  byId('q-search').addEventListener('click', commitSearch);
  byId('q-input').addEventListener('keydown', function(e){ if (e.key === 'Enter') commitSearch(); });
</script>
`,
      "utf8",
    );

    const bin = join(root, "scripts", "check-artifact.mjs");
    const runBad = spawnSync(process.execPath, [bin, bad], { cwd: root, encoding: "utf8" });
    const runGood = spawnSync(process.execPath, [bin, good], { cwd: root, encoding: "utf8" });

    // Advisory only: surfaces the on-change wiring but must NOT fail the build.
    assert.equal(runBad.status, 0, runBad.stdout);
    assert.match(runBad.stdout, /search\/filter wired on change/i);
    // The draft→applied (click + Enter) wiring raises no such advisory.
    assert.equal(runGood.status, 0, runGood.stdout);
    assert.doesNotMatch(runGood.stdout, /search\/filter wired on change/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
