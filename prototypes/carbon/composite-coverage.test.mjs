import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const prototypeRoot = join(root, "prototypes", "carbon");

const compositeAnchors = {
  "app-frame": "app-frame",
  chart: "chart",
  "data-table": "data-table",
  "detail-header": "detail-header",
  diff: "diff",
  "empty-state": "empty-state",
  "feed-list": "feed-list",
  "kv-grid": "kv-grid",
  "list-filter": "condition-band",
  "list-row": "list-row",
  "load-more": "load-more",
  "option-card": "option-card",
  "page-body": "page-body",
  "page-header": "page-header",
  pagination: "pagination",
  "product-card": "product-card",
  "rich-pagination": "rich-pagination",
  skeleton: "skeleton",
  "stat-card": "stat-card",
  "step-indicator": "step-indicator",
  stepper: "stepper",
  "summary-bar": "summary-bar",
  "theme-toggle": "theme-toggle",
  timeline: "timeline",
  toggles: "toggle-checkbox",
};

function markupOnly(html) {
  return html
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function usedMarkupClasses() {
  const used = new Set();
  for (const name of readdirSync(prototypeRoot)) {
    if (!name.endsWith(".html")) continue;
    const markup = markupOnly(readFileSync(join(prototypeRoot, name), "utf8"));
    for (const match of markup.matchAll(/\sclass\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
      for (const cls of (match[1] ?? match[2] ?? "").split(/\s+/)) {
        if (cls) used.add(cls);
      }
    }
  }
  return used;
}

test("carbon prototypes cover every catalogued composite", () => {
  const catalog = JSON.parse(readFileSync(join(root, "release", "catalog.json"), "utf8"));
  const catalogNames = catalog.composites.map((item) => item.name).sort();
  assert.deepEqual(Object.keys(compositeAnchors).sort(), catalogNames);

  const used = usedMarkupClasses();
  const missing = Object.entries(compositeAnchors)
    .filter(([, anchor]) => !used.has(anchor))
    .map(([name]) => name);

  assert.deepEqual(missing, []);
});
