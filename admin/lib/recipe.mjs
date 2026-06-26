// admin/lib/recipe.mjs
// Token recipe extractor for Foundation admin platform.
// Core extraction internals ported from docs/tools/detail-page-tokens/extract.mjs
// (those functions already passed that tool's own unit tests — behavior preserved).
// ROOT adjusted for admin/lib (two levels up to foundation root).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { listComponents } from "./catalog.mjs";
import { activeRoot } from "./paths.mjs";

const read = (p) => readFileSync(join(activeRoot(), p), "utf8");

// ── Ported internals from extract.mjs ────────────────────────────────────────

/** Flatten every :root{} / [data-theme]{} block's `--x: value;` into one map.
 *  For light theme we take the FIRST occurrence (dist light :root precedes dark). */
export function parseRootVars(css) {
  const map = new Map();
  const decl = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = decl.exec(css))) {
    const [, name, value] = m;
    if (!map.has(name)) map.set(name, value.trim());
  }
  return map;
}

export function resolveChain(name, varMap) {
  const chain = [name];
  let cur = varMap.get(name);
  let guard = 0;
  while (cur && /^var\(\s*(--[\w-]+)\s*\)$/.test(cur) && guard++ < 10) {
    const next = cur.match(/^var\(\s*(--[\w-]+)\s*\)$/)[1];
    chain.push(next);
    cur = varMap.get(next);
  }
  return { chain, literal: (cur ?? "").replace(/\s+/g, " ").trim() };
}

export function classifyType(name, varMap) {
  if (/^--space-\d+$/.test(name)) return "scale";
  if (/^--spacing-(control|cx)-|^--spacing-stat-card$/.test(name)) return "semantic-spacing";
  const def = (varMap.get(name) ?? "").trim();
  const isColor = name.startsWith("--color-");
  if (isColor && /^var\(/.test(def)) return "alias";
  if (isColor) return "ramp";
  return "other";
}

const TOKEN_SOURCES = [
  "tokens/palette.css","tokens/surface.css","tokens/typography.css",
  "tokens/elevation.css","tokens/layout.css","tokens/motion.css","tokens/chart.css"
];
const USAGE_SOURCES = ["primitives/primitives.css","composites/composites.css", ...TOKEN_SOURCES];

export function defFileOf(name, sourceTexts) {
  for (const f of TOKEN_SOURCES)
    if (new RegExp(`${name}\\s*:`).test(sourceTexts[f] || "")) return f;
  return "tokens/(unknown)";
}

export function blastRadius(name, sourceTexts) {
  const re = new RegExp(`var\\(\\s*${name}\\b`, "g");
  const sample = []; let count = 0;
  for (const f of USAGE_SOURCES) {
    const text = sourceTexts[f] || "";
    const hits = (text.match(re) || []).length;
    count += hits;
    if (hits) sample.push(`${f.split("/").pop()}×${hits}`);
  }
  return { count, sample };
}

export function buildTokenDict(varMap, sourceTexts) {
  const dict = {};
  for (const [name] of varMap) {
    const { chain, literal } = resolveChain(name, varMap);
    dict[name] = {
      type: classifyType(name, varMap),
      chain, literal,
      isColor: name.startsWith("--color-") || /oklch|#|rgb/.test(literal),
      defFile: defFileOf(name, sourceTexts),
      blastRadius: blastRadius(name, sourceTexts),
    };
  }
  return dict;
}

/** Load all sources needed for token resolution + blast-radius.
 *  CONTROLLER FIX: includes dist/tokens.inline.css so tokenDict() can call
 *  parseRootVars() on it directly — no require_inline() needed. */
export function loadSources() {
  const o = {};
  // Include tokens.inline.css for parseRootVars (the var-map source)
  try { o["dist/tokens.inline.css"] = read("dist/tokens.inline.css"); } catch { o["dist/tokens.inline.css"] = ""; }
  for (const f of USAGE_SOURCES) {
    try { o[f] = read(f); } catch { o[f] = ""; }
  }
  return o;
}

// ── Category mapping ──────────────────────────────────────────────────────────

export const CATEGORY = {
  color: ["color","background-color","border-color","outline-color","fill","stroke"],
  type:  ["font-family","font-size","font-weight","line-height","letter-spacing","text-transform","font-variant-numeric"],
  space: ["gap","row-gap","column-gap","padding","padding-inline","padding-block","padding-top","padding-right","padding-bottom","padding-left",
          "margin","margin-top","margin-right","margin-bottom","margin-left","height","width","min-width","max-width","min-height","aspect-ratio","inset",
          "top","right","bottom","left"],
  border:["border","border-bottom","border-top","border-left","border-right","border-inline","border-block",
          "border-width","border-style","border-radius","box-shadow","outline","outline-width"],
};

const groupOf = (prop) => Object.keys(CATEGORY).find(g => CATEGORY[g].includes(prop)) || "other";

/** Get the base rule body and pseudo-class rules for an exact single selector. */
export function rulesFor(selector, css) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const out = { base: "", pseudo: [] };
  const baseRe = new RegExp(`(?:^|[},])\\s*${esc}\\s*\\{([^}]*)\\}`, "gm");
  let m;
  while ((m = baseRe.exec(css))) out.base += m[1];
  const psRe = new RegExp(`${esc}((?::[a-z-]+(?:\\([^)]*\\))?)+)[^{]*\\{([^}]*)\\}`, "g");
  while ((m = psRe.exec(css))) {
    const label = pseudoLabel(m[1]);
    if (label) out.pseudo.push({ pseudo: label, body: m[2] });
  }
  return out;
}

function pseudoLabel(raw) {
  const stripped = raw.replace(/:not\([^)]*\)/g, "");
  const mm = stripped.match(/:[a-z-]+(?:\([^)]*\))?/);
  return mm ? mm[0] : "";
}

export function declsOf(body) {
  const out = []; const re = /([\w-]+)\s*:\s*([^;]+);/g; let m;
  while ((m = re.exec(body))) out.push({ prop: m[1].trim(), value: m[2].trim() });
  return out;
}

export const tokenIn = (value) => (value.match(/var\(\s*(--[\w-]+)/)?.[1]) ?? null;

// ── Variant discovery ─────────────────────────────────────────────────────────

/** Given a base selector like ".btn", find all ".btn--*" variant selectors
 *  that appear as CSS rules (base rules, not just pseudo rules). */
function discoverVariants(baseSelector, css) {
  const esc = baseSelector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Match selectors like .btn--primary, .btn--secondary, etc.
  // Pattern: after a line boundary or `}` or `,`, find `baseSel--word` followed by `{` or `:` or ` `
  const variantRe = new RegExp(`(?:^|[},\\s])(${esc}--[\\w-]+)(?=[\\s:{,{])`, "gm");
  const found = new Set();
  let m;
  while ((m = variantRe.exec(css))) {
    found.add(m[1].trim());
  }
  return [...found];
}

// ── Base+variant merge helper (the "mergeClassesDecls" equivalent) ────────────

/**
 * Collect declarations for a single CSS class selector from the given CSS text.
 *
 * @param {string} selector - e.g. ".btn"
 * @param {string} css
 * @param {boolean} withVariants - when true, also fold in this selector's
 *   `--variant` sub-rules (e.g. .btn--primary). This must only be true for the
 *   component's OWN root class; composed-in primitives (other classes in the
 *   catalog `classes[]`) contribute their BASE-rule tokens only, so a composite
 *   does not absorb a primitive's full variant palette (attribution bleed).
 *
 * Returns { allGroupDecls, pseudoEntries }
 * where pseudoEntries = [{pseudo, prop, token?, value?}]
 */
function gatherDeclsForSelector(selector, css, withVariants) {
  const allGroupDecls = [];  // { prop, value, sourceSelector } from base (+ variants when allowed)
  const pseudoMap = new Map(); // `pseudo:prop` → {pseudo, prop, token?, value?, sourceSelector}

  const fold = (body, src) => { for (const d of declsOf(body)) allGroupDecls.push({ ...d, sourceSelector: src }); };
  const foldPseudo = (psList, src) => {
    for (const { pseudo: ps, body } of psList) {
      for (const { prop, value } of declsOf(body)) {
        const key = `${ps}:${prop}`;
        if (!pseudoMap.has(key)) {
          const token = tokenIn(value);
          pseudoMap.set(key, token ? { pseudo: ps, prop, token, sourceSelector: src } : { pseudo: ps, prop, value, sourceSelector: src });
        }
      }
    }
  };

  // 1. Base selector
  const { base: baseBody, pseudo: basePseudo } = rulesFor(selector, css);
  fold(baseBody, selector);
  foldPseudo(basePseudo, selector);

  // 2. Variants (.btn--primary, …) — own root class only.
  if (withVariants) {
    for (const vsel of discoverVariants(selector, css)) {
      const { base: vBody, pseudo: vPseudo } = rulesFor(vsel, css);
      fold(vBody, vsel);
      foldPseudo(vPseudo, vsel);
    }
  }

  return { allGroupDecls, pseudoEntries: [...pseudoMap.values()] };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * recipeForClasses(classes, cssByLayer, opts) → { groups, pseudo }
 *
 * @param {string[]} classes - array of CSS class selectors, e.g. [".btn", ".btn--primary"]
 * @param {{ primitives: string, composites: string }} cssByLayer
 * @param {{ variants?: boolean }} [opts] - when `variants:true`, the OWN root class
 *   (classes[0]) also folds in its discovered `--variant` sub-rules (used by the
 *   per-component overview `recipeFor`). Default `false` = EXACT: only the literal
 *   classes passed contribute (used by `/api/element-recipe` so clicking one element
 *   surfaces that element's tokens, not the whole variant family — and so composites
 *   whose classes[0] is a borrowed primitive like `.card` don't absorb `.card--*`).
 */
export function recipeForClasses(classes, cssByLayer, opts = {}) {
  const wantVariants = opts.variants === true;
  const groups = { color:[], type:[], space:[], border:[] };
  const pseudoMap = new Map();  // `pseudo:prop:token/value:sourceSelector` → entry
  const groupSeen = new Set();  // `prop::token/value::sourceSelector` for main group dedup

  const cssLayers = [cssByLayer.primitives, cssByLayer.composites].filter(Boolean);

  // Only the OWN root class (the first in classes[]) expands its --variant rules,
  // and only when variants are requested; composed-in primitives contribute
  // base-rule tokens only (no variant bleed).
  for (let i = 0; i < classes.length; i++) {
    const selector = classes[i];
    const withVariants = wantVariants && i === 0;
    for (const css of cssLayers) {
      const sourceLayer = css === cssByLayer.primitives ? "primitive" : "composite";
      const { allGroupDecls, pseudoEntries } = gatherDeclsForSelector(selector, css, withVariants);

      for (const { prop, value, sourceSelector } of allGroupDecls) {
        const g = groupOf(prop);
        if (!groups[g]) continue;
        const token = tokenIn(value);
        // Include sourceSelector in the dedup key so two different rules that
        // declare the same prop+token both survive carrying their own correct
        // sourceLayer/sourceSelector (Task 4 edits the right file/rule).
        const dedupKey = `${prop}::${token ?? value}::${sourceSelector}`;
        if (groupSeen.has(dedupKey)) continue;
        groupSeen.add(dedupKey);
        groups[g].push(token ? { prop, token, sourceSelector, sourceLayer } : { prop, value, sourceSelector, sourceLayer });
      }

      for (const entry of pseudoEntries) {
        const { pseudo: ps, prop, token, value, sourceSelector } = entry;
        const dedupKey = `${ps}:${prop}::${token ?? value}::${sourceSelector}`;
        if (!pseudoMap.has(dedupKey)) {
          pseudoMap.set(dedupKey, { ...entry, sourceLayer });
        }
      }
    }
  }

  return { groups, pseudo: [...pseudoMap.values()] };
}

// ── No module-level caching: activeRoot() can change between calls (draft edits).

function sources() {
  return loadSources();
}

/**
 * tokenDict() → { "--x": { type, chain, literal, isColor, defFile, blastRadius } }
 *
 * CONTROLLER FIX: uses dist/tokens.inline.css (included in loadSources) as
 * the var-map source for parseRootVars — no require_inline() call needed.
 * No module-level cache: each call re-reads from activeRoot() so draft edits
 * are reflected immediately.
 */
export function tokenDict() {
  const src = sources();
  const varMap = parseRootVars(src["dist/tokens.inline.css"] ?? "");
  return buildTokenDict(varMap, src);
}

/**
 * loadSourcesForRecipe() → { primitives: string, composites: string }
 * Reads the two CSS layers from activeRoot() for use with recipeForClasses().
 */
export function loadSourcesForRecipe() {
  const safeRead = (p) => { try { return read(p); } catch { return ""; } };
  return {
    primitives: safeRead("primitives/primitives.css"),
    composites: safeRead("composites/composites.css"),
  };
}

/**
 * recipeFor(layer, name) → { layer, name, classes, groups, pseudo } | null
 */
export function recipeFor(layer, name) {
  const entry = listComponents().find(e => e.layer === layer && e.name === name);
  if (!entry) return null;
  const src = sources();
  const cssByLayer = {
    primitives: src["primitives/primitives.css"],
    composites: src["composites/composites.css"],
  };
  const { groups, pseudo } = recipeForClasses(entry.classes, cssByLayer, { variants: true });
  return { layer, name, classes: entry.classes, groups, pseudo };
}
