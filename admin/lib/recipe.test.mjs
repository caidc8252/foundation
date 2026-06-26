import { test } from "node:test";
import assert from "node:assert/strict";
import { recipeFor, tokenDict } from "./recipe.mjs";

test("button recipe surfaces primary tokens + pseudo", () => {
  const r = recipeFor("primitive", "button");
  assert.ok(r.groups.color.some(u => u.token === "--color-primary-700"));
  assert.ok(r.groups.space.some(u => u.token === "--spacing-control-md" || u.prop === "height"));
  assert.ok(r.pseudo.some(p => p.pseudo === ":hover"));
});

test("tokenDict resolves alias chain", () => {
  const d = tokenDict();
  assert.deepEqual(d["--color-success-bg"].chain, ["--color-success-bg", "--color-success-50"]);
});
