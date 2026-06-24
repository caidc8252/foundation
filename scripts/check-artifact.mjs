#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Foundation · artifact closed-set check

   Makes governance/enforcement.md's artifact checklist RUNNABLE. Scans a
   self-contained artifact HTML and reports anything OUTSIDE the foundation
   closed set (dist/catalog.json):

     ✗ hardcoded color literals   — a token covers every brand color
     ✗ unknown var(--…) refs      — token name not in the set (typo / invented)
     ⚠ classes not in the set     — neither a foundation class nor defined in
                                     this file's own <style> (page-local
                                     composition is allowed; an off-set
                                     component library is not — review these)

   The two ✗ categories are hard violations (non-zero exit). Classes are
   advisory: a page may legitimately compose a few local helper classes in its
   own <style>; this only surfaces names that are NEITHER foundation NOR local
   so a typo'd `.btn-primary` or a stray Bootstrap class can't slip through.

   Usage:  node scripts/check-artifact.mjs <file.html> [more.html …]
   Build the catalog first if missing:  pnpm build
   ───────────────────────────────────────────────────────────── */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "dist", "catalog.json");
if (!existsSync(catalogPath)) {
  console.error("✗ dist/catalog.json missing — run `pnpm build` first.");
  process.exit(2);
}
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const TOKENS = new Set(catalog.tokens);
const CLASSES = new Set(catalog.classes);

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: node scripts/check-artifact.mjs <file.html> […]");
  process.exit(2);
}

// Strip CSS rule bodies (repeat for nesting) so only selector text remains.
const selectorsOnly = (css) => {
  let prev;
  do { prev = css; css = css.replace(/\{[^{}]*\}/g, " "); } while (css !== prev);
  return css;
};

let hardTotal = 0;
for (const file of files) {
  if (!existsSync(file)) {
    console.log(`\n● ${file}\n  ✗ file not found`);
    hardTotal++;
    continue;
  }
  const html = readFileSync(file, "utf8");

  // Classes the file defines in its OWN <style> are allowed (page-local composition).
  const styleCss = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
  const local = new Set();
  for (const m of selectorsOnly(styleCss).matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) local.add(m[1]);

  // 1. Classes used in markup.
  const used = new Set();
  for (const m of html.matchAll(/class\s*=\s*"([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (c) used.add(c);
  for (const m of html.matchAll(/class\s*=\s*'([^']*)'/g)) for (const c of m[1].split(/\s+/)) if (c) used.add(c);
  const offSetClasses = [...used].filter((c) => !CLASSES.has(c) && !local.has(c)).sort();

  // 2. var(--x) refs must name a real token.
  const refs = new Set();
  for (const m of html.matchAll(/var\(\s*(--[A-Za-z_][\w-]*)/g)) refs.add(m[1].slice(2));
  const unknownTokens = [...refs].filter((t) => !TOKENS.has(t)).sort();

  // 3. Hardcoded color literals (every brand color has a token). SVG uses
  //    stroke="currentColor", so any hex / raw color function is a literal.
  const colorLiterals = [
    ...html.matchAll(/#[0-9a-fA-F]{3,8}\b/g),
    ...html.matchAll(/\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\([^)]*\)/g),
  ]
    .map((m) => m[0])
    // color-mix(in oklch, var(--token) …) is token-based, not a literal — keep only
    // raw functions, and drop any that wrap a var().
    .filter((s) => !s.includes("var("));
  const hardColors = [...new Set(colorLiterals)];

  const hard = unknownTokens.length + hardColors.length;
  hardTotal += hard;

  console.log(`\n● ${file}`);
  console.log(`  classes: ${used.size} used · ${offSetClasses.length} off-set (not foundation, not local)`);
  if (offSetClasses.length) console.log(`    ⚠ review: ${offSetClasses.join(", ")}`);
  console.log(`  tokens:  ${refs.size} var(--…) refs · ${unknownTokens.length} unknown`);
  if (unknownTokens.length) console.log(`    ✗ not a foundation token: ${unknownTokens.map((t) => "--" + t).join(", ")}`);
  console.log(`  colors:  ${hardColors.length} hardcoded literal(s)`);
  if (hardColors.length) console.log(`    ✗ use a token, not a literal: ${hardColors.join(", ")}`);
  console.log(`  → ${hard === 0 ? "PASS (no out-of-set tokens, no hardcoded colors)" : `FAIL (${hard} hard violation(s))`}`);
}

console.log(`\n${hardTotal === 0 ? "✓ all clean" : `✗ ${hardTotal} hard violation(s)`}`);
process.exit(hardTotal === 0 ? 0 : 1);
