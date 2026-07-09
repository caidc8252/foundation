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

test("check-artifact flags spec-internal ids in copy, but not comments or mock-data ids", () => {
  const dir = mkdtempSync(join(tmpdir(), "foundation-artifact-"));
  try {
    const file = join(dir, "internal-ids.html");
    writeFileSync(
      file,
      `<!doctype html>
<p>At most one active contract at a time (R-1).</p>
<!-- enforces party.md#R-1 — sanctioned traceability channel, must not flag -->
<div id="x"></div>
<script>
  var roles = [{ id: 'R-301', name: 'Fleet' }];   // mock-data id, not copy
  document.getElementById('x').innerHTML = '<span>writes an audit-log entry (R-5)</span>';
</script>
`,
      "utf8",
    );

    const run = spawnSync(
      process.execPath,
      [join(root, "scripts", "check-artifact.mjs"), file],
      { cwd: root, encoding: "utf8" },
    );

    // Advisory: parenthesized R-1 (static) + R-5 (JS-templated) are flagged…
    assert.equal(run.status, 0, run.stdout);
    assert.match(run.stdout, /spec-internal id/i);
    assert.match(run.stdout, /\(R-1\)/);
    assert.match(run.stdout, /\(R-5\)/);
    // …but the HTML-comment #R-1 and the quoted mock-data id R-301 are not.
    assert.doesNotMatch(run.stdout, /R-301/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("check-artifact flags a .theme-toggle in a frameless page, not in a full shell", () => {
  const dir = mkdtempSync(join(tmpdir(), "foundation-artifact-"));
  try {
    // BAD: frameless business page invents app-shell chrome (a theme toggle).
    const bad = join(dir, "frameless-chrome.html");
    writeFileSync(
      bad,
      `<!doctype html>
<div class="app-frame app-frame--frameless"><main class="app-frame__main">
  <button class="theme-toggle" type="button" aria-label="Toggle dark mode">x</button>
</main></div>
`,
      "utf8",
    );
    // GOOD: a full app-frame (with top bar) may host a theme toggle.
    const good = join(dir, "fullshell-chrome.html");
    writeFileSync(
      good,
      `<!doctype html>
<div class="app-frame"><header class="app-frame__topbar">
  <button class="theme-toggle" type="button" aria-label="Toggle dark mode">x</button>
</header></div>
`,
      "utf8",
    );

    const bin = join(root, "scripts", "check-artifact.mjs");
    const runBad = spawnSync(process.execPath, [bin, bad], { cwd: root, encoding: "utf8" });
    const runGood = spawnSync(process.execPath, [bin, good], { cwd: root, encoding: "utf8" });

    // Advisory only: surfaces the invented chrome but must NOT fail the build.
    assert.equal(runBad.status, 0, runBad.stdout);
    assert.match(runBad.stdout, /app-shell chrome in a frameless page/i);
    // The full shell may carry the toggle — no advisory.
    assert.equal(runGood.status, 0, runGood.stdout);
    assert.doesNotMatch(runGood.stdout, /app-shell chrome in a frameless page/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("check-artifact rejects a fused card stack (hard), but not spaced or hidden-sibling stacks", () => {
  const dir = mkdtempSync(join(tmpdir(), "foundation-artifact-"));
  try {
    // BAD: a bare block wrapper stacks 3 visible cards with no gap and no card
    // margin — they fuse into one slab (the hand-rolled step/section wrapper that
    // forgot its .stack--N rhythm).
    const bad = join(dir, "fused-cards.html");
    writeFileSync(
      bad,
      `<!doctype html>
<style>.co-step { display: block; }</style>
<div class="co-step">
  <div class="card"><div class="card__content">A</div></div>
  <div class="card"><div class="card__content">B</div></div>
  <div class="card"><div class="card__content">C</div></div>
</div>
`,
      "utf8",
    );
    // GOOD: three legit rhythms, none should trip —
    //   1. a .stack--N rung,
    //   2. a hand-rolled flex-column + gap wrapper (a working stack; policing FORM
    //      would false-positive here — the check is outcome-based),
    //   3. a wizard step-switcher whose cards are mutually exclusive (2 hidden), so
    //      only one renders at rest and they never fuse.
    const good = join(dir, "spaced-cards.html");
    writeFileSync(
      good,
      `<!doctype html>
<style>.mywrap { display: flex; flex-direction: column; gap: var(--space-6); }</style>
<div class="stack stack--6">
  <div class="card"><div class="card__content">A</div></div>
  <div class="card"><div class="card__content">B</div></div>
</div>
<div class="mywrap">
  <div class="card"><div class="card__content">C</div></div>
  <div class="card"><div class="card__content">D</div></div>
</div>
<div class="wizard-grid"><div>
  <div class="card wz-step"><div class="card__content">1</div></div>
  <div class="card wz-step is-hidden"><div class="card__content">2</div></div>
  <div class="card wz-step is-hidden"><div class="card__content">3</div></div>
</div></div>
`,
      "utf8",
    );

    const bin = join(root, "scripts", "check-artifact.mjs");
    const runBad = spawnSync(process.execPath, [bin, bad], { cwd: root, encoding: "utf8" });
    const runGood = spawnSync(process.execPath, [bin, good], { cwd: root, encoding: "utf8" });

    // Hard violation: non-zero exit, names the fused wrapper + the rhythm to use.
    assert.notEqual(runBad.status, 0, runBad.stdout);
    assert.match(runBad.stdout, /fused card stack/i);
    assert.match(runBad.stdout, /\.stack--N/);
    assert.match(runBad.stdout, /co-step/);
    // The spaced / hand-rolled-stack / hidden-sibling structures raise no violation.
    assert.equal(runGood.status, 0, runGood.stdout);
    assert.match(runGood.stdout, /block rhythm: ok/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("check-artifact rejects native date/time inputs (hard), but not plain text inputs", () => {
  const dir = mkdtempSync(join(tmpdir(), "foundation-artifact-"));
  try {
    // Native rich date/time chrome — a hard violation; must name the picker family.
    // Covers a static input, a JS-templated one (in <script>), month, plus a BARE
    // (unskinned) time input — the date types are flagged even when they wear
    // `.input` (native calendar is unskinnable); a raw time input is flagged too.
    const bad = join(dir, "native-date.html");
    writeFileSync(
      bad,
      `<!doctype html>
<div>
  <input class="input input--sm" type="date" aria-label="From date">
  <input class="input" type="month">
  <input type="time" aria-label="Bare time">
  <script>el.innerHTML = '<input class="input" type="datetime-local">';</script>
</div>
`,
      "utf8",
    );

    // Legitimate foundation inputs — plain text/search/number on .input must PASS,
    // and a SKINNED native time input IS the foundation time-picker (allowed).
    const good = join(dir, "text-inputs.html");
    writeFileSync(
      good,
      `<!doctype html>
<div>
  <input class="input" type="text" placeholder="Name">
  <input class="input" type="search" aria-label="Search">
  <input class="input" type="number">
  <input class="input input--md input-group__control" type="time" aria-label="Start time">
</div>
`,
      "utf8",
    );

    const bin = join(root, "scripts", "check-artifact.mjs");
    const runBad = spawnSync(process.execPath, [bin, bad], { cwd: root, encoding: "utf8" });
    const runGood = spawnSync(process.execPath, [bin, good], { cwd: root, encoding: "utf8" });

    // Hard violation: non-zero exit, names the offending types + the picker family.
    assert.notEqual(runBad.status, 0, runBad.stdout);
    assert.match(runBad.stdout, /native browser date\/time chrome/i);
    assert.match(runBad.stdout, /date-picker/);
    assert.match(runBad.stdout, /date-time-picker/);
    assert.match(runBad.stdout, /\.date-trigger/);
    // The bare time input is flagged and routed to the time-picker recipe.
    assert.match(runBad.stdout, /time-picker/);

    // Plain text/search/number + a SKINNED native time input must not trip.
    assert.equal(runGood.status, 0, runGood.stdout);
    assert.match(runGood.stdout, /date\/time inputs: ok/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("check-artifact rejects hardcoded font weight and line height, but accepts typography tokens", () => {
  const dir = mkdtempSync(join(tmpdir(), "foundation-artifact-"));
  try {
    const bad = join(dir, "raw-typography.html");
    writeFileSync(
      bad,
      `<!doctype html>
<div class="card" style="font-weight: 800; line-height: 1.23;">
  <div class="card__content">Raw typography values</div>
</div>
<style>
  .local-title { font-weight: 600; line-height: 1.4; }
</style>
`,
      "utf8",
    );

    const good = join(dir, "token-typography.html");
    writeFileSync(
      good,
      `<!doctype html>
<div class="card" style="font-weight: var(--font-weight-semibold); line-height: var(--line-height-compact);">
  <div class="card__content">Tokenized typography values</div>
</div>
<style>
  .local-title { font-weight: var(--font-weight-medium); line-height: var(--line-height-normal); }
</style>
`,
      "utf8",
    );

    const bin = join(root, "scripts", "check-artifact.mjs");
    const runBad = spawnSync(process.execPath, [bin, bad], { cwd: root, encoding: "utf8" });
    const runGood = spawnSync(process.execPath, [bin, good], { cwd: root, encoding: "utf8" });

    assert.notEqual(runBad.status, 0, runBad.stdout);
    assert.match(runBad.stdout, /typography/i);
    assert.match(runBad.stdout, /font-weight: 800/);
    assert.match(runBad.stdout, /line-height: 1\.23/);

    assert.equal(runGood.status, 0, runGood.stdout);
    assert.match(runGood.stdout, /typography: ok/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
