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

   Presence tier: it asks "is this composite's class family used at all?"
   via a lenient class harvest (regex, no DOM parser) — so it never false-fails
   a present-but-degenerate composite. Nesting checks (header outside page-body,
   condition-band not carded, single-arrow row) need a DOM parser and are a
   later tier, not here.

   Layout tier: for a detail-page it also checks the LAYOUT VARIANT, not just
   presence. A detail body carrying many independent, substantial sections must
   be the `tabbed` variant (patterns/detail-page.md) — cramming three thick
   sub-views into a flat/split overview instead of tabbing them is a real
   deviation the presence tier waves through (every section is a legal card).
   Same 母版-derivation philosophy as the presence tier → zero false-positive:
   the tabbed 母版 (patterns/detail-page.html) has tabs, so the trigger never
   fires on it, and the threshold IS the 母版's own titled-section count — the
   very point at which foundation itself reached for tabs. Still pure regex, no
   DOM parser.

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

// ── layout tier (detail-page only) ────────────────────────────────────────
// A detail body is either the `overview` variant (1–2 core blocks, laid out
// directly) or the `tabbed` variant (multiple peer sub-views become a Tabs set).
// The contract (patterns/detail-page.md) mandates tabs once sub-views are
// "genuinely independent and substantial"; the rail holds only stat/amount, and
// a flat/split body must NOT swallow several thick sections. This tier catches
// the deviation the presence tier can't see: three thick sections crammed into a
// tab-less overview.

// Does the artifact carry the detail tab family at all? (any one token = tabbed)
const DETAIL_TAB_TOKENS = ["detail-header__tabs", "tabs__list", "tabs__content", "tabs__trigger"];
const hasDetailTabs = (used) => DETAIL_TAB_TOKENS.some((tok) => used.has(tok));

// The content region — scope the section count to page-body so the header band
// (identity / meta / actions) can never inflate it. Falls back to the whole
// document if no page-body is found (malformed; presence tier owns that).
const pageBodyOf = (html) => {
  const m = html.match(/class\s*=\s*["'][^"']*\bpage-body\b/i);
  return m ? html.slice(m.index) : html;
};

// "Thick section" = a titled content card (a `.card__title`). In a tab-less
// detail there are no tabs to name sections, so every substantial section must
// carry its own title — exactly what card__title marks. (Header-less rich cards
// exist ONLY because a tab labels them; without tabs, sections are titled.) So
// counting card__title accurately counts the independent thick sub-views.
const countThickSections = (html) => (html.match(/\bcard__title\b/g) || []).length;

// Threshold, DERIVED from the archetype's 母版 (never hand-written): the count of
// thick titled sections the 母版 itself distributes across its tab panels — the
// point at which foundation reached for tabs. A tab-less body with ≥ this many
// thick sections should likewise have been tabbed. null if the 母版 is missing →
// tier skips (advisory-safe, never a false fail).
const detailThresholdCache = new Map();
const detailThickThreshold = (route) => {
  const rel = route.example;
  if (!rel) return null;
  if (detailThresholdCache.has(rel)) return detailThresholdCache.get(rel);
  const p = join(root, rel);
  if (!existsSync(p)) {
    detailThresholdCache.set(rel, null);
    return null;
  }
  const n = countThickSections(pageBodyOf(readFileSync(p, "utf8")));
  // Contract floor: the `overview` variant legally holds 1–2 core blocks, so the
  // fail threshold can never drop below 3 (a 2-card overview must always pass).
  // The real detail-page 母版 derives exactly 3; this clamp only guards against a
  // degenerate 母版 (e.g. one stripped to a single titled card) silently
  // over-tightening the tier onto legal overviews.
  const threshold = Math.max(n, 3);
  detailThresholdCache.set(rel, threshold);
  return threshold;
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

      // ── layout tier — detail body must be TABBED once it carries many thick
      //    sub-views. Fires only for the detail-page pattern (covers any future
      //    detail variant that maps to it), only when the body has NO tabs, and
      //    only past the 母版-derived threshold. The tabbed 母版 has tabs, so this
      //    never fires on it → zero false-positive by construction.
      if (route.pattern === "detail-page" && !hasDetailTabs(used)) {
        const threshold = detailThickThreshold(route); // null if 母版 unavailable
        if (threshold) {
          const thick = countThickSections(pageBodyOf(html));
          if (thick >= threshold) {
            findings.push([
              "✗",
              `detail 多厚重区（${thick} 个带标题分区 ≥ ${threshold}）而无 tab — 应为 tabbed 变体，见 patterns/detail-page.md`,
            ]);
            hardFail = true;
          }
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
