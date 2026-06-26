import { readFileSync } from "node:fs";
import { join } from "node:path";
import { listComponents } from "./catalog.mjs";
import { demoFor } from "./demos.mjs";
import { activeRoot, ROOT } from "./paths.mjs";

// CSS layers come from activeRoot() so edited tokens/CSS show in the render.
const read = (p) => readFileSync(join(activeRoot(), p), "utf8");
// Pattern .html files are NOT draft-editable (only the tokens/CSS they reference
// are); ensureDraft() never copies patterns/, so always read them from ROOT.
const readRoot = (p) => readFileSync(join(ROOT, p), "utf8");

// No module-level cache: activeRoot() can change between calls (draft edits).
function inlineCss() {
  return [
    "dist/tokens.inline.css",
    "primitives/primitives.css",
    "composites/composites.css",
  ].map(read).join("\n");
}

const SELECTION_HELPER_CSS = `
[data-admin-hover]{outline:2px dashed #6366f1;outline-offset:2px;}
[data-admin-selected]{outline:2px solid #6366f1;outline-offset:2px;}
`;

function patternBody(html) {
  // pattern .html is a full page; extract the inner of <main class="app-frame__main">…</main>.
  // If no match, return the whole file as fallback.
  const m = html.match(/<main class="app-frame__main">([\s\S]*?)<\/main>/);
  return m ? m[1] : html;
}

/** Extract all <style>…</style> block contents from a pattern HTML string.
 *  Neutralise any literal "</style>" inside the CSS (e.g. in a comment) so it
 *  can't break out of the inlined <style> tag. */
function patternStyles(html) {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map(m => m[1])
    .join("\n")
    .replace(/<\/style>/gi, "<\\/style>");
}

export function renderComponent(layer, name) {
  const entry = listComponents().find(e => e.layer === layer && e.name === name);
  if (!entry) {
    return `<!doctype html><meta charset="utf-8"><body>unknown ${layer}/${name}</body>`;
  }
  // Read the pattern .html once (from ROOT) and feed it to both helpers.
  const patternHtml = entry.example ? readRoot(entry.example) : "";
  const body = entry.example ? patternBody(patternHtml) : demoFor(entry).html;
  const pageLocalStyles = entry.example ? patternStyles(patternHtml) : "";
  return `<!doctype html><meta charset="utf-8">
<style>${inlineCss()}
${pageLocalStyles}
${SELECTION_HELPER_CSS}
  body{margin:0;padding:20px;background:var(--color-surface-1);font-family:var(--font-sans)}</style>
<body>${body}</body>`;
}
