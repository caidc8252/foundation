#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Foundation · artifact closed-set check

   Makes governance/enforcement.md's artifact checklist RUNNABLE. Scans an
   artifact HTML and reports anything OUTSIDE the foundation closed set
   (dist/catalog.json):

     ✗ hardcoded color literals   — a token covers every brand color
     ✗ unknown var(--…) refs      — token name not in the set (typo / invented)
     ⚠ classes not in the set     — neither a foundation class nor defined in
                                     this file's own <style> (page-local
                                     composition is allowed; an off-set
                                     component library is not — review these)

   The two ✗ categories are hard violations (non-zero exit). Classes are
   advisory by default; pass --strict to make off-set classes fail too.

   The checker understands shipped artifacts with the three foundation CSS
   layers inlined. It removes those known layer bodies before scanning for
   authored CSS violations, so token definitions do not count as hardcoded
   artifact colors.

   Usage:  node scripts/check-artifact.mjs [--strict] <file.html> [more.html …]
   Build the catalog first if missing:  pnpm build
   ───────────────────────────────────────────────────────────── */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { hasIcon, bodyMatches, VERSION as ICON_VERSION } from "./icon/registry.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "dist", "catalog.json");
if (!existsSync(catalogPath)) {
  console.error("✗ dist/catalog.json missing — run `pnpm build` first.");
  process.exit(2);
}
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const TOKENS = new Set(catalog.tokens);
const CLASSES = new Set(catalog.classes);
const FOUNDATION_LAYERS = [
  ["dist/tokens.inline.css", readFileSync(join(root, "dist", "tokens.inline.css"), "utf8")],
  ["primitives/primitives.css", readFileSync(join(root, "primitives", "primitives.css"), "utf8")],
  ["composites/composites.css", readFileSync(join(root, "composites", "composites.css"), "utf8")],
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

const tokenRefsFromAuthored = (text) => {
  const refs = new Set();
  for (const m of stripCssComments(text).matchAll(/var\(\s*(--[A-Za-z_][\w-]*)/g)) {
    refs.add(m[1].slice(2));
  }
  return refs;
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

  // 2. var(--x) refs must name a real token.
  const refs = tokenRefsFromAuthored(authored);
  const unknownTokens = [...refs].filter((t) => !TOKENS.has(t)).sort();

  // 3. Hardcoded color literals (every brand color has a token). SVG uses
  //    stroke="currentColor", so any hex / raw color function is a literal.
  const hardColors = hardcodedColorsFromAuthored(authored);

  // 4. Inline Lucide icons: unknown names always fail; altered paths fail in
  //    strict (warn otherwise); untagged icon-shaped svgs always warn.
  const icons = iconFindingsFromMarkup(markup);

  const hard =
    unknownTokens.length +
    hardColors.length +
    icons.unknown.length +
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
  const passText = strict
    ? "PASS (strict: no out-of-set tokens, hardcoded colors, or off-set classes)"
    : "PASS (no out-of-set tokens, no hardcoded colors)";
  console.log(`  → ${hard === 0 ? passText : `FAIL (${hard} hard violation(s))`}`);
}

console.log(`\n${hardTotal === 0 ? "✓ all clean" : `✗ ${hardTotal} hard violation(s)`}`);
process.exit(hardTotal === 0 ? 0 : 1);
