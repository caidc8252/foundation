#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation stacking-ladder check

   `z-index` is a token like any other (principles §4). The ladder lives in
   tokens/elevation.css as `--z-*`; the governed reference CSS may only reach for
   a rung, never a bare number — a hand-picked number is how a component quietly
   outranks the dialog layer.

   Asserts:
     1. the ladder is well-formed and strictly ordered (a bad edit to the ladder
        itself silently reorders every surface in the system);
     2. primitives/primitives.css + composites/composites.css carry no raw
        `z-index: <n>` — those are the sources every artifact inlines;
     3. no example / pattern page carries one either. A builder copies these pages,
        so a `z-index: 999` there teaches exactly the habit the ladder bans. A page
        that re-declares z-index on a class the reference CSS already places on the
        ladder is duplication: delete the line and inherit the rung.

   Need an order the ladder can't express? Add a rung via governance/token-change.md
   — don't reach for a bare number.

   Usage:  node scripts/check-z-index.mjs
   --------------------------------------------------------------------------- */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* The ladder, low rung first. Order here IS the assertion. */
const RUNGS = ["z-behind", "z-base", "z-raised", "z-sticky", "z-dialog", "z-popover", "z-tooltip", "z-toast"];
const GOVERNED = ["primitives/primitives.css", "composites/composites.css"];

const RAW_DECL = /z-index:\s*(-?\d+)/;
const VAR_DECL = /z-index:\s*var\(\s*--([\w-]+)\s*\)/;

/* Blank out comment bodies but keep every newline, so line numbers still hold. */
const decomment = (css) =>
  css.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "));

let failures = 0;
const fail = (msg) => { console.log(`  ✗ ${msg}`); failures++; };

/* ── 1. the ladder itself ─────────────────────────────────────────────────── */
const elevation = readFileSync(join(root, "tokens", "elevation.css"), "utf8");
const ladder = {};
for (const [, name, value] of decomment(elevation).matchAll(/--(z-[\w-]+)\s*:\s*(-?\d+)\s*;/g)) {
  ladder[name] = Number(value);
}

for (const rung of RUNGS) if (!(rung in ladder)) fail(`tokens/elevation.css is missing --${rung}`);
for (const name of Object.keys(ladder)) {
  if (!RUNGS.includes(name)) fail(`tokens/elevation.css defines --${name}, which is not a known rung`);
}
if (!failures) {
  for (let i = 1; i < RUNGS.length; i++) {
    const [lo, hi] = [RUNGS[i - 1], RUNGS[i]];
    if (ladder[lo] >= ladder[hi]) {
      fail(`ladder out of order: --${lo} (${ladder[lo]}) must sit below --${hi} (${ladder[hi]})`);
    }
  }
}
if (!failures) console.log(`  ladder: ${RUNGS.map((r) => `${r.slice(2)}=${ladder[r]}`).join(" < ")}`);

/* ── 2. governed sources use rungs, never numbers ─────────────────────────── */
let rungUses = 0;
for (const rel of GOVERNED) {
  decomment(readFileSync(join(root, rel), "utf8")).split("\n").forEach((line, i) => {
    const raw = line.match(RAW_DECL);
    if (raw) {
      fail(`${rel}:${i + 1} — raw z-index: ${raw[1]}; snap to a --z-* rung (principles §4)`);
      return;
    }
    const used = line.match(VAR_DECL);
    if (!used) return;
    rungUses++;
    if (!RUNGS.includes(used[1])) fail(`${rel}:${i + 1} — var(--${used[1]}) is not a rung on the ladder`);
  });
}
if (!failures) console.log(`  governed CSS: ${rungUses} z-index declarations, all on the ladder`);

/* ── 3. example + pattern pages use rungs too ─────────────────────────────── */
const pages = ["primitives", "composites", "patterns"].flatMap((dir) =>
  readdirSync(join(root, dir)).filter((f) => f.endsWith(".html")).map((f) => `${dir}/${f}`),
);
let pageUses = 0;
for (const rel of pages) {
  decomment(readFileSync(join(root, rel), "utf8")).split("\n").forEach((line, i) => {
    if (RAW_DECL.test(line)) {
      fail(`${rel}:${i + 1} — raw z-index: ${line.match(RAW_DECL)[1]}; use a --z-* rung, or drop the line if the element's class already carries one`);
      return;
    }
    const used = line.match(VAR_DECL);
    if (!used) return;
    pageUses++;
    if (!RUNGS.includes(used[1])) fail(`${rel}:${i + 1} — var(--${used[1]}) is not a rung on the ladder`);
  });
}
if (!failures) console.log(`  example pages: ${pages.length} scanned, ${pageUses} z-index declaration(s), all on the ladder`);

if (failures) {
  console.log(`  → FAIL (${failures} issue${failures === 1 ? "" : "s"})`);
  process.exit(1);
}
console.log("  → PASS");
