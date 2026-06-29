import { test } from "node:test";
import assert from "node:assert/strict";
import { recipeForClasses, loadSourcesForRecipe } from "./recipe.mjs";
import { renderComponent } from "./render.mjs";
import { ensureDraft, discardDraft } from "./draft.mjs";
import { setTokenValue } from "./edit.mjs";

test("recipeForClasses tags sourceLayer", () => {
  const css = loadSourcesForRecipe();
  const r = recipeForClasses([".btn", ".btn--primary"], css);
  const bg = r.groups.color.find(u => u.token === "--color-primary-700");
  assert.ok(bg, "primary bg present");
  assert.equal(bg.sourceLayer, "primitive");
  assert.equal(bg.sourceSelector, ".btn--primary");
});

test("pattern render inlines its page-local <style> (kv reveal styles present)", () => {
  const html = renderComponent("pattern", "detail-page");
  assert.match(html, /\.kv__value--reveal\s*\{/, "page-local kv styles inlined for fidelity");
});

test("element-recipe is EXACT — no variant discovery (Fix B)", () => {
  const css = loadSourcesForRecipe();
  const r = recipeForClasses([".btn", ".btn--primary"], css); // default opts = exact
  const tokens = r.groups.color.map(u => u.token);
  assert.ok(tokens.includes("--color-primary-700"), "primary variant token present");
  // secondary/danger variants must NOT bleed in when not explicitly clicked
  assert.ok(!tokens.includes("--color-surface-2"), "secondary variant must not leak");
  assert.ok(!tokens.some(t => t && /error/.test(t)), "danger variant must not leak");
});

test("dedup keeps cross-rule entries with correct source (Fix C)", () => {
  const css = loadSourcesForRecipe();
  // .detail-header__meta (composite) declares font-size:var(--text-xs); so does
  // .badge (primitive). The composite entry must survive with its OWN source.
  const r = recipeForClasses([".detail-header__meta"], css);
  const fs = r.groups.type.find(u => u.prop === "font-size" && u.token === "--text-xs");
  assert.ok(fs, "detail-header__meta font-size present");
  assert.equal(fs.sourceLayer, "composite");
  assert.equal(fs.sourceSelector, ".detail-header__meta");
});

test("pattern render works in draft mode and reflects edited token (Fix A)", () => {
  try {
    ensureDraft();
    setTokenValue("--color-surface-1", "oklch(50% 0.1 30)");
    let html;
    assert.doesNotThrow(() => { html = renderComponent("pattern", "detail-page"); },
      "pattern render must not throw (ENOENT) in draft mode");
    assert.match(html, /\.kv__value--reveal\s*\{/, "pattern markup still inlined from ROOT");
    assert.match(html, /oklch\(50% 0\.1 30\)/, "edited token reflected via activeRoot CSS");
  } finally {
    discardDraft();
  }
});
