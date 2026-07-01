#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Foundation · artifact closed-set check

   Makes governance/enforcement.md's artifact checklist RUNNABLE. Scans an
   artifact HTML and reports anything OUTSIDE the foundation closed set
   (release/catalog.json):

     ✗ hardcoded color literals   — a token covers every brand color
     ✗ unknown var(--…) refs      — token name not in the set (typo / invented)
     ⚠ classes not in the set     — neither a foundation class nor defined in
                                     this file's own <style> (page-local
                                     composition is allowed; an off-set
                                     component library is not — review these)
     ⚠ inline padding/margin hack — style="padding:0"-style layout resets;
                                     prefer a class (.stack--N / --flush). Advisory
                                     only — never affects the exit code.
     ⚠ .table-frame--flush in .card — two frame mechanisms fight; the card owns
                                     the frame and its overflow:hidden traps the
                                     sticky header --flush exists to free (see the
                                     function note). Advisory only — never affects
                                     the exit code.
     ⚠ search/filter wired on change — a search/filter control that runs the query
                                     on `input`/`change` instead of on the Search
                                     button / Enter (principle 14). HEURISTIC scan of
                                     the raw script; advisory only — never affects the
                                     exit code (see the function note).

   The two ✗ categories are hard violations (non-zero exit). Classes are
   advisory by default; pass --strict to make off-set classes fail too.

   The checker understands shipped artifacts with the three foundation CSS
   layers inlined. It removes those known layer bodies before scanning for
   authored CSS violations, so token definitions do not count as hardcoded
   artifact colors.

   Usage:  node scripts/check-artifact.mjs [--strict] <file.html> [more.html …]
   Build the release snapshot first if missing:  pnpm build
   ───────────────────────────────────────────────────────────── */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { hasIcon, bodyMatches, VERSION as ICON_VERSION } from "./icon/registry.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const requireFoundationFile = (path) => {
  const file = join(root, path);
  if (!existsSync(file)) {
    console.error(`✗ ${path} missing — run \`pnpm build\` first.`);
    process.exit(2);
  }
  return readFileSync(file, "utf8");
};

const catalogPath = join(root, "release", "catalog.json");
if (!existsSync(catalogPath)) {
  console.error("✗ release/catalog.json missing — run `pnpm build` first.");
  process.exit(2);
}
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const TOKENS = new Set(catalog.tokens);
const CLASSES = new Set(catalog.classes);
const FOUNDATION_LAYERS = [
  ["release/tokens.inline.css", requireFoundationFile("release/tokens.inline.css")],
  ["primitives/primitives.css", requireFoundationFile("primitives/primitives.css")],
  ["release/composites.css", requireFoundationFile("release/composites.css")],
];

const usage = () => {
  console.error("usage: node scripts/check-artifact.mjs [--strict] <file.html> […]");
};

let strict = false;
const files = [];
for (const arg of process.argv.slice(2)) {
  if (arg === "--") {
    continue;
  } else if (arg === "--strict") {
    strict = true;
  } else if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else if (arg.startsWith("-")) {
    console.error(`unknown option: ${arg}`);
    usage();
    process.exit(2);
  } else {
    files.push(arg);
  }
}
if (!files.length) {
  usage();
  process.exit(2);
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const stripHtmlComments = (html) => html.replace(/<!--[\s\S]*?-->/g, " ");
const stripScriptBlocks = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ");
const stripStyleBlocks = (html) => html.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ");
const stripCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, " ");

// A color literal is only a violation in a CSS context — a <style> body or an
// element attribute (style="…", fill="…", stroke="…"). In text content, "#10482"
// is an order number, not a color. Keep tags (their attributes) + page CSS, but
// drop the text nodes between tags so demo copy never trips the color check.
const colorScanSurface = (markup, pageCss) => `${markup.replace(/>[^<]*</g, "><")}\n${pageCss}`;

const extractStyleCss = (html) =>
  [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map((m) => m[1]).join("\n");

const removeKnownFoundationCss = (css) => {
  let out = css;
  const removed = [];
  for (const [name, layer] of FOUNDATION_LAYERS) {
    const before = out;
    out = out.replace(new RegExp(escapeRegExp(layer), "g"), "");
    if (out !== before) removed.push(name);
  }
  return { css: out, removed };
};

const authoredSurfaces = (html) => {
  const styleCss = extractStyleCss(html);
  const { css: pageCss, removed } = removeKnownFoundationCss(styleCss);
  const markup = stripHtmlComments(stripStyleBlocks(stripScriptBlocks(html)));
  return {
    markup,
    pageCss,
    authored: `${markup}\n${pageCss}`,
    removedLayers: removed,
  };
};

// Strip CSS rule bodies (repeat for nesting) so only selector text remains.
const selectorsOnly = (css) => {
  let prev;
  do { prev = css; css = css.replace(/\{[^{}]*\}/g, " "); } while (css !== prev);
  return css;
};

const localClassesFromCss = (css) => {
  const local = new Set();
  for (const m of selectorsOnly(stripCssComments(css)).matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) {
    local.add(m[1]);
  }
  return local;
};

const usedClassesFromMarkup = (markup) => {
  const used = new Set();
  for (const tag of markup.matchAll(/<([A-Za-z][A-Za-z0-9:-]*)(?:\s[^<>]*)?>/g)) {
    const attrs = tag[0];
    for (const m of attrs.matchAll(/\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi)) {
      const raw = m[1] ?? m[2] ?? m[3] ?? "";
      for (const c of raw.split(/\s+/)) if (c) used.add(c);
    }
  }
  return used;
};

const classAttrValuesFromTag = (tag) => {
  const values = [];
  for (const m of tag.matchAll(/\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi)) {
    values.push(m[1] ?? m[2] ?? m[3] ?? "");
  }
  return values;
};

const structuralFindingsFromMarkup = (markup) => {
  const cellTagsOnTableCells = [];
  for (const m of markup.matchAll(/<(td|th)\b(?:\s[^<>]*)?>/gi)) {
    const tag = m[0];
    const classValues = classAttrValuesFromTag(tag);
    if (classValues.some((raw) => raw.split(/\s+/).includes("cell-tags"))) {
      cellTagsOnTableCells.push(tag.length > 90 ? `${tag.slice(0, 87)}…` : tag);
    }
  }
  return { cellTagsOnTableCells };
};

// A `.table-frame--flush` nested inside a `.card` is a self-defeating double-frame.
// The card already owns the border / radius / shadow (`.card__content--flush >
// .table-frame` in composites.css strips the inner one), AND the card's own
// `overflow: hidden` re-creates the scroll-container trap that `--flush`
// (`overflow: clip`) exists to avoid — so a sticky summary-bar / thead gets pinned
// to the card instead of propagating to the app-frame scroll root. The list
// "results card" should BE a standalone `.table-frame--flush` (patterns/list-page.md),
// not wrapped in a card; a plain table inside a section card uses `.table-frame`
// (no `--flush`). Advisory ONLY — never affects the exit code: rule 312 hides the
// visual double-border, so this bites only once sticky headers are enabled.
const VOID_ELEMENTS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const flushFrameNestingFromMarkup = (markup) => {
  const hits = [];
  const stack = [];
  let openCards = 0;
  for (const m of markup.matchAll(/<(\/)?([A-Za-z][A-Za-z0-9:-]*)((?:\s[^<>]*)?)>/g)) {
    const [full, closing, rawName, attrs] = m;
    const tag = rawName.toLowerCase();
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) {
          for (let j = stack.length - 1; j >= i; j--) if (stack[j].card) openCards--;
          stack.length = i;
          break;
        }
      }
      continue;
    }
    const classes = classAttrValuesFromTag(full).join(" ").split(/\s+/);
    // Check ancestry BEFORE self-push: an element is never its own ancestor.
    if (classes.includes("table-frame--flush") && openCards > 0) {
      hits.push(full.length > 90 ? `${full.slice(0, 87)}…` : full);
    }
    const selfClose = attrs.trimEnd().endsWith("/") || VOID_ELEMENTS.has(tag);
    if (!selfClose) {
      const card = classes.includes("card");
      stack.push({ tag, card });
      if (card) openCards++;
    }
  }
  return hits;
};

// Principle 14: filtering commits on the Search button / Enter, NEVER on change.
// Unlike every other check, this one scans the RAW html (scripts included) for a
// search/filter control wired to an on-change handler: an `input` (search-as-you-type)
// or `change` (filter-on-select) listener whose TARGET names a search/filter element
// (id/var contains search·filter·query·keyword·q-input·q-search), or an inline
// on{input,change} on a `type="search"` field. `keydown`/`keyup` are deliberately
// NOT matched — that is the legitimate Enter-to-commit path.
// HEURISTIC + advisory only (never affects the exit code): it cannot tell a draft
// update (allowed) from a query run (the defect), and a listener on a generically
// named variable or a quick-filter <select> with a neutral id slips through. It
// surfaces the obvious wiring so a human applies principle 14 — a review-gate rule
// the static closed-set check can't own. Most missed under detail-page tabs.
const SEARCH_TARGET = /(search|filter|query|keyword|q[-_]?input|q[-_]?search)/i;
const searchOnChangeFromHtml = (html) => {
  const hits = new Set();
  // A target expression immediately before .addEventListener / .on* — e.g.
  // byId('q-input'), searchInput, document.querySelector('.search-input .input').
  const target = "([A-Za-z_$][\\w$]*(?:\\([^()]*\\)|\\[[^\\]]*\\]|\\.[A-Za-z_$][\\w$]*)*)";
  for (const m of html.matchAll(new RegExp(`${target}\\s*\\.addEventListener\\(\\s*['"](input|change)['"]`, "g"))) {
    if (SEARCH_TARGET.test(m[1])) hits.add(`${m[1].trim()}.addEventListener('${m[2]}', …)`);
  }
  for (const m of html.matchAll(new RegExp(`${target}\\s*\\.on(input|change)\\s*=`, "g"))) {
    if (SEARCH_TARGET.test(m[1])) hits.add(`${m[1].trim()}.on${m[2]} = …`);
  }
  for (const m of html.matchAll(/<input\b[^>]*\bon(input|change)\s*=[^>]*>/gi)) {
    if (/type\s*=\s*["']search["']/i.test(m[0]) || /class\s*=\s*["'][^"']*search-input/i.test(m[0])) {
      hits.add(`inline on${m[1]} on <input type="search">`);
    }
  }
  return [...hits];
};

const tokenRefsFromAuthored = (text) => {
  const refs = new Set();
  for (const m of stripCssComments(text).matchAll(/var\(\s*(--[A-Za-z_][\w-]*)/g)) {
    refs.add(m[1].slice(2));
  }
  return refs;
};

// Custom properties the artifact DEFINES itself — page-local CSS variables (an
// animation/state var like --toast-duration, set in its own <style>, an inline
// style="--x:…", or via JS setProperty). Allowed exactly like page-local classes:
// a var() resolving to one of these is page-local composition, not an off-set
// foundation-token reference. A var() to a `--x` that is never defined and not a
// foundation token stays flagged (catches typos / renamed tokens).
const locallyDefinedTokensFromHtml = (html) => {
  const defs = new Set();
  for (const m of html.matchAll(/(--[A-Za-z_][\w-]*)\s*:/g)) defs.add(m[1].slice(2));
  for (const m of html.matchAll(/setProperty\(\s*["'](--[A-Za-z_][\w-]*)["']/g)) defs.add(m[1].slice(2));
  return defs;
};

// Inline Lucide icons. Every icon must carry `data-lucide="<name>"`: the name
// must be a real Lucide icon (no invented names) and the pasted body must be
// that icon's real geometry (no hand-edited / hallucinated paths). An
// icon-shaped <svg> with no data-lucide is un-mappable to lucide-react — warn.
const iconFindingsFromMarkup = (markup) => {
  const unknown = new Set();
  const mismatch = new Set();
  let untagged = 0;
  for (const m of markup.matchAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg\s*>/gi)) {
    const [openAttrs, inner] = [m[1], m[2]];
    const dl = openAttrs.match(/data-lucide\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    if (dl) {
      const name = dl[1] ?? dl[2];
      if (!hasIcon(name)) unknown.add(name);
      else if (!bodyMatches(name, inner)) mismatch.add(name);
    } else if (/viewBox\s*=\s*["']0 0 24 24["']/.test(openAttrs)) {
      untagged++;
    }
  }
  return { unknown: [...unknown].sort(), mismatch: [...mismatch].sort(), untagged };
};

const hardcodedColorsFromAuthored = (text) => {
  const stripped = stripCssComments(text);
  const colorLiterals = [
    ...stripped.matchAll(/#[0-9a-fA-F]{3,8}\b/g),
    ...stripped.matchAll(/\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\([^)]*\)/g),
  ]
    .map((m) => m[0])
    // color-mix(in oklch, var(--token) …) is token-based, not a literal — keep only
    // raw functions, and drop any that wrap a var().
    .filter((s) => !s.includes("var("));
  return [...new Set(colorLiterals)];
};

// Inline style="…padding…/…margin…" layout hacks. Spacing/flush is a composition
// choice (a token-based class — .stack--N, .card__content--flush, or a page-local
// class), never an inline reset like style="padding:0". Advisory ONLY — never
// affects the exit code, even in --strict: it's a smell to review, not a
// closed-set breach (the value carries no off-set token/color).
const inlineLayoutHacksFromMarkup = (markup) => {
  const hits = new Set();
  for (const m of markup.matchAll(/\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    const val = (m[1] ?? m[2] ?? "").trim();
    if (/\b(?:padding|margin)\b/i.test(val)) hits.add(val.length > 60 ? val.slice(0, 57) + "…" : val);
  }
  return [...hits].sort();
};

let hardTotal = 0;
for (const file of files) {
  if (!existsSync(file)) {
    console.log(`\n● ${file}\n  ✗ file not found`);
    hardTotal++;
    continue;
  }
  const html = readFileSync(file, "utf8");
  const { markup, pageCss, authored, removedLayers } = authoredSurfaces(html);

  // Classes the file defines in its OWN <style> are allowed (page-local composition).
  const local = localClassesFromCss(pageCss);

  // 1. Classes used in markup.
  const used = usedClassesFromMarkup(markup);
  const offSetClasses = [...used].filter((c) => !CLASSES.has(c) && !local.has(c)).sort();

  // 2. var(--x) refs must name a real token — unless the artifact defines that
  //    custom property itself (page-local CSS variable, allowed like a local class).
  const refs = tokenRefsFromAuthored(authored);
  const localTokens = locallyDefinedTokensFromHtml(html);
  const unknownTokens = [...refs].filter((t) => !TOKENS.has(t) && !localTokens.has(t)).sort();

  // 3. Hardcoded color literals (every brand color has a token). SVG uses
  //    stroke="currentColor", so any hex / raw color function is a literal.
  //    Scan CSS + attributes only — never text content (an order "#10482" is not a color).
  const hardColors = hardcodedColorsFromAuthored(colorScanSurface(markup, pageCss));

  // 4. Inline Lucide icons: unknown names always fail; altered paths fail in
  //    strict (warn otherwise); untagged icon-shaped svgs always warn.
  const icons = iconFindingsFromMarkup(markup);

  // 5. Structural table contracts. `.cell-tags` is a flex wrapper inside a cell;
  // placing it on <td>/<th> changes the browser's table layout and breaks row rules.
  const structure = structuralFindingsFromMarkup(markup);

  // Advisory: inline padding/margin layout hacks (never affects exit code).
  const layoutHacks = inlineLayoutHacksFromMarkup(markup);

  // Advisory: a `.table-frame--flush` wrapped in a `.card` — two frame mechanisms
  // fight and the card's overflow:hidden defeats the flush frame's sticky propagation.
  const flushNesting = flushFrameNestingFromMarkup(markup);

  // Advisory: a search/filter control wired to run on change (principle 14 forbids it).
  // Scans the RAW html (scripts included), unlike the closed-set checks above.
  const searchOnChange = searchOnChangeFromHtml(html);

  const hard =
    unknownTokens.length +
    hardColors.length +
    icons.unknown.length +
    structure.cellTagsOnTableCells.length +
    (strict ? offSetClasses.length + icons.mismatch.length : 0);
  hardTotal += hard;

  console.log(`\n● ${file}`);
  console.log(`  foundation CSS: ${removedLayers.length ? `ignored ${removedLayers.join(", ")}` : "no inlined layer bodies found"}`);
  console.log(`  classes: ${used.size} used · ${offSetClasses.length} off-set (not foundation, not local)`);
  if (offSetClasses.length) {
    const marker = strict ? "✗" : "⚠ review:";
    console.log(`    ${marker} ${offSetClasses.join(", ")}`);
  }
  console.log(`  tokens:  ${refs.size} var(--…) refs · ${unknownTokens.length} unknown`);
  if (unknownTokens.length) console.log(`    ✗ not a foundation token: ${unknownTokens.map((t) => "--" + t).join(", ")}`);
  console.log(`  colors:  ${hardColors.length} hardcoded literal(s)`);
  if (hardColors.length) console.log(`    ✗ use a token, not a literal: ${hardColors.join(", ")}`);
  const iconBad = icons.unknown.length + icons.mismatch.length + icons.untagged;
  console.log(`  icons:   ${iconBad === 0 ? "ok" : `${iconBad} issue(s)`} (Lucide ${ICON_VERSION})`);
  if (icons.unknown.length)
    console.log(`    ✗ not a Lucide icon (run icon.mjs search): ${icons.unknown.join(", ")}`);
  if (icons.mismatch.length) {
    const marker = strict ? "✗" : "⚠ review:";
    console.log(`    ${marker} altered icon path — re-fetch with icon.mjs get: ${icons.mismatch.join(", ")}`);
  }
  if (icons.untagged)
    console.log(`    ⚠ review: ${icons.untagged} icon-shaped <svg> with no data-lucide (un-mappable to lucide-react)`);
  const structureBad = structure.cellTagsOnTableCells.length;
  console.log(`  structure: ${structureBad === 0 ? "ok" : `${structureBad} issue(s)`}`);
  if (structureBad)
    console.log(`    ✗ .cell-tags is a flex wrapper inside the table cell; do not put it on ${structure.cellTagsOnTableCells.join(", ")}`);
  if (layoutHacks.length)
    console.log(`  ⚠ review: ${layoutHacks.length} inline padding/margin style(s) — prefer a class (.stack--N / .card__content--flush / page-local): ${layoutHacks.join(" · ")}`);
  if (flushNesting.length)
    console.log(`  ⚠ review: ${flushNesting.length} .table-frame--flush inside a .card — the card owns the frame and its overflow:hidden traps the sticky header; make the list results card a standalone .table-frame--flush (patterns/list-page.md), or drop --flush for a plain table in a section card: ${flushNesting.join(" · ")}`);
  if (searchOnChange.length)
    console.log(`  ⚠ review: ${searchOnChange.length} search/filter wired on change — filtering must commit on the Search button / Enter, never on change (principle 14). Verify these edit a draft only, not run the query: ${searchOnChange.join(" · ")}`);
  const passText = strict
    ? "PASS (strict: no out-of-set tokens, hardcoded colors, or off-set classes)"
    : "PASS (no out-of-set tokens, no hardcoded colors)";
  console.log(`  → ${hard === 0 ? passText : `FAIL (${hard} hard violation(s))`}`);
}

console.log(`\n${hardTotal === 0 ? "✓ all clean" : `✗ ${hardTotal} hard violation(s)`}`);
process.exit(hardTotal === 0 ? 0 : 1);
