#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · artifact anatomy check (presence tier)

   Complements check-artifact.mjs (legality) with structural COMPLETENESS:
   does a screen carry the composites its archetype requires? A list page that
   renders a table but no pagination / summary-bar is legal (every class is in
   the set) yet structurally unfinished — check-artifact passes it, this catches
   it.

   How it decides the archetype: the artifact stamps its own archetype with
     <!-- archetype: list-page -->
   (parallel to the <!-- foundation: <tag> --> stamp). No stamp → completeness
   is skipped with an advisory note (never a hard fail — back-compat).

   Presence tier only: it asks "is this composite's class family used at all?"
   via a lenient class harvest (regex, no DOM parser) — so it never false-fails
   a present-but-degenerate composite. Nesting checks (header outside page-body,
   condition-band not carded, single-arrow row) need a DOM parser and are a
   later tier, not here.

   Exit: 0 ok · 1 violations · 2 setup error.

   Usage:  node scripts/check-anatomy.mjs <file.html> [more.html …]
   --------------------------------------------------------------------------- */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const failSetup = (message) => {
  console.error(`✗ ${message}`);
  process.exit(2);
};

const requireJson = (rel) => {
  const p = join(root, rel);
  if (!existsSync(p)) failSetup(`missing ${rel} — run \`pnpm build\` first`);
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    failSetup(`cannot parse ${rel}: ${e.message}`);
  }
};

const catalog = requireJson("release/catalog.json");
const router = requireJson("patterns/router.json");

// composite name → its class family (leading-dot stripped), from the catalog.
const familyByName = new Map(
  (catalog.composites || []).map((c) => [
    c.name,
    (c.classes || []).map((cls) => cls.replace(/^\./, "")),
  ]),
);

// Which of an archetype's router composites are HARD (missing = fail) vs
// ADVISORY (missing = warn) is derived from the archetype's own 母版
// (patterns/<archetype>.html): a composite the 母版 itself renders is
// structurally essential; one it omits (a detail page's timeline/diff, a list's
// empty/skeleton state) is contextual. This guarantees the 母版 always passes —
// zero false-positive by construction — and auto-updates when foundation edits a
// 母版, with no hand-curated carve-out.
const mubanCompositesCache = new Map();
const compositesUsedByMuban = (route) => {
  const rel = route.example; // e.g. "patterns/list-page.html"
  if (!rel) return null;
  if (mubanCompositesCache.has(rel)) return mubanCompositesCache.get(rel);
  const p = join(root, rel);
  if (!existsSync(p)) {
    mubanCompositesCache.set(rel, null);
    return null;
  }
  const used = classesUsed(readFileSync(p, "utf8"));
  const set = new Set();
  for (const [name, family] of familyByName) {
    if (family.some((cls) => used.has(cls))) set.add(name);
  }
  mubanCompositesCache.set(rel, set);
  return set;
};

const files = process.argv.slice(2).filter((a) => !a.startsWith("-"));
if (files.length === 0) {
  console.error("usage: node scripts/check-anatomy.mjs <file.html> […]");
  process.exit(2);
}

// Harvest every class token the artifact uses. Scans the RAW html (scripts
// included) so JS-templated rows (`'<td class="cell-num">'`) count. Lenient by
// design: a present composite must never read as absent.
const classesUsed = (html) => {
  const set = new Set();
  for (const m of html.matchAll(
    /\sclass\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
  )) {
    for (const tok of (m[1] ?? m[2] ?? "").split(/\s+/)) {
      if (tok) set.add(tok);
    }
  }
  return set;
};

let hardFail = false;

for (const file of files) {
  if (!existsSync(file)) {
    console.error(`✗ ${file}: not found`);
    hardFail = true;
    continue;
  }
  const html = readFileSync(file, "utf8");
  const used = classesUsed(html);
  const findings = [];

  const stamp = html.match(/<!--\s*archetype:\s*([a-z0-9-]+)\s*-->/i);
  if (!stamp) {
    findings.push(["⚠", "no <!-- archetype: … --> stamp — completeness skipped"]);
  } else {
    const archetype = stamp[1].toLowerCase();
    const route = router.routes?.[archetype];
    if (!route) {
      findings.push(["✗", `unknown archetype "${archetype}" — not in router.json`]);
      hardFail = true;
    } else {
      const essential = compositesUsedByMuban(route); // null if 母版 unavailable
      for (const name of route.composites || []) {
        const family = familyByName.get(name);
        if (!family || family.length === 0) continue; // container-only, nothing to detect
        if (family.some((cls) => used.has(cls))) continue; // present
        // No 母版 to compare against → advisory only, never a hard fail.
        if (essential && essential.has(name)) {
          findings.push(["✗", `missing required composite "${name}" (母版 renders it)`]);
          hardFail = true;
        } else {
          findings.push(["⚠", `missing composite "${name}" (advisory)`]);
        }
      }
    }
  }

  if (findings.length === 0) {
    console.log(`✓ ${file}: anatomy ok`);
  } else {
    const arche = stamp ? ` [${stamp[1]}]` : "";
    console.log(`${file}${arche}:`);
    for (const [mark, msg] of findings) console.log(`  ${mark} ${msg}`);
  }
}

process.exit(hardFail ? 1 : 0);
