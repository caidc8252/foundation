import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const carbonDir = join(root, "prototypes", "carbon");

const menuItems = [
  { href: "customer-list.html", label: "Customers" },
  { href: "order-list.html", label: "Orders" },
  { href: "catalog.html", label: "Catalog" },
  { href: "device-monitoring.html", label: "Device Monitoring" },
  { href: "published-apps.html", label: "Published Apps" },
  { href: "app-publish-list.html", label: "App Publish" },
];

const activeRules = [
  [/^customer-(?:list|detail|new)\.html$/, "customer-list.html"],
  [/^order-(?:list|detail|new)\.html$/, "order-list.html"],
  [/^catalog\.html$/, "catalog.html"],
  [/^device-monitoring\.html$/, "device-monitoring.html"],
  [/^(?:published-apps|published-app-detail|published-version-detail)\.html$/, "published-apps.html"],
  [/^(?:app-publish-list|app-detail|app-new|publish-wizard|version-detail)\.html$/, "app-publish-list.html"],
];

function expectedActiveHref(fileName) {
  const match = activeRules.find(([pattern]) => pattern.test(fileName));
  assert.ok(match, `No active nav rule for ${fileName}`);
  return match[1];
}

function getSidebarNav(html, fileName) {
  const match = html.match(/<nav class="app-frame__nav">([\s\S]*?)<\/nav>/);
  assert.ok(match, `${fileName} should render the app sidebar menu`);
  return match[1];
}

test("carbon prototype sidebar exposes every top-level module", () => {
  const pages = readdirSync(carbonDir)
    .filter((fileName) => fileName.endsWith(".html"))
    .sort();

  for (const fileName of pages) {
    const html = readFileSync(join(carbonDir, fileName), "utf8");
    const nav = getSidebarNav(html, fileName);

    for (const item of menuItems) {
      assert.ok(nav.includes(`href="${item.href}"`), `${fileName} missing menu link to ${item.href}`);
      assert.ok(nav.includes(`<span>${item.label}</span>`), `${fileName} missing menu label ${item.label}`);
    }

    const activeLinks = Array.from(
      nav.matchAll(/<a class="[^"]*\bapp-frame__nav-item--active\b[^"]*" href="([^"]+)"([^>]*)>/g),
    );
    assert.equal(activeLinks.length, 1, `${fileName} should have exactly one active menu item`);
    assert.equal(activeLinks[0][1], expectedActiveHref(fileName));
    assert.match(activeLinks[0][2], /\baria-current="page"/, `${fileName} active item should expose aria-current`);
  }
});

test("carbon prototype pages load the shared editor controls", () => {
  const pages = readdirSync(carbonDir)
    .filter((fileName) => fileName.endsWith(".html"))
    .sort();

  for (const fileName of pages) {
    const html = readFileSync(join(carbonDir, fileName), "utf8");
    assert.ok(/<script src="editor\.js\?v=[^"]+"><\/script>/.test(html), `${fileName} should load editor.js`);
  }
});
