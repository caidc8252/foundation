import { test } from "node:test";
import assert from "node:assert/strict";
import { readCatalog, listComponents } from "./catalog.mjs";

test("readCatalog has the layer arrays", () => {
  const c = readCatalog();
  assert.ok(c.primitives.length >= 50 && c.composites.length >= 20 && c.patterns.length >= 5);
});
test("listComponents flattens + carries fields", () => {
  const all = listComponents();
  const btn = all.find(e => e.layer === "primitive" && e.name === "button");
  assert.ok(btn, "button present");
  assert.ok(Array.isArray(btn.classes) && btn.classes.includes(".btn"));
  const dp = all.find(e => e.layer === "pattern" && e.name === "detail-page");
  assert.equal(dp.example, "patterns/detail-page.html");
});
