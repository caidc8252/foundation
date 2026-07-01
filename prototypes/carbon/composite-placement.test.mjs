import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const carbonDir = join(root, "prototypes", "carbon");

function readPage(name) {
  return readFileSync(join(carbonDir, name), "utf8");
}

function markupOnly(html) {
  return html
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function appHeader(markup, fileName) {
  const match = markup.match(/<header class="app-frame__header">([\s\S]*?)<\/header>/);
  assert.ok(match, `${fileName} should render the shared app header`);
  return match[1];
}

function appMain(markup, fileName) {
  const marker = '<main class="app-frame__main">';
  assert.ok(markup.includes(marker), `${fileName} should render the app main region`);
  return markup.slice(markup.indexOf(marker) + marker.length);
}

test("catalog does not carry non-catalog composite coverage", () => {
  const catalog = appMain(markupOnly(readPage("catalog.html")), "catalog.html");
  assert.equal(catalog.includes("theme-toggle"), false, "Catalog page body should not own theme switching");
  assert.equal(catalog.includes("load-more"), false, "Catalog should not use load-more as artificial coverage");
  assert.equal(catalog.includes("summary-bar"), false, "Catalog should not use summary-bar as artificial coverage");
});

test("theme toggle is a shared app header control", () => {
  const pages = readdirSync(carbonDir)
    .filter((fileName) => fileName.endsWith(".html"))
    .sort();

  for (const fileName of pages) {
    const header = appHeader(markupOnly(readPage(fileName)), fileName);
    assert.ok(header.includes("theme-toggle"), `${fileName} app header should include theme-toggle`);
  }
});

test("device monitoring uses load-more in the activity feed", () => {
  const device = markupOnly(readPage("device-monitoring.html"));
  assert.match(device, /<h2 class="card__title">Recent activity<\/h2>[\s\S]*class="feed-list"[\s\S]*class="load-more"/);
});
