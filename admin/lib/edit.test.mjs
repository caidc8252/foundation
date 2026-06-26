import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, DRAFT } from "./paths.mjs";
import { discardDraft } from "./draft.mjs";
import { setTokenValue, repointAlias, setReference } from "./edit.mjs";

test("setTokenValue edits the draft palette + rebuilds inline, root untouched", () => {
  discardDraft();
  try {
    const rootBefore = readFileSync(join(ROOT, "tokens/palette.css"), "utf8");
    setTokenValue("--color-primary-700", "oklch(50% 0.2 20)");
    const draftPalette = readFileSync(join(DRAFT, "tokens/palette.css"), "utf8");
    assert.match(draftPalette, /--color-primary-700:\s*oklch\(50% 0\.2 20\)/);
    const draftInline = readFileSync(join(DRAFT, "dist/tokens.inline.css"), "utf8");
    assert.match(draftInline, /--color-primary-700:\s*oklch\(50% 0\.2 20\)/);
    assert.equal(readFileSync(join(ROOT, "tokens/palette.css"), "utf8"), rootBefore, "ROOT must be untouched");
  } finally { discardDraft(); }
});
test("setTokenValue rejects malformed values", () => {
  discardDraft();
  try {
    assert.throws(() => setTokenValue("--color-primary-700", "red; } body{display:none"));
  } finally { discardDraft(); }
});
test("repointAlias rewrites the alias target in draft tokens + rebuilds", () => {
  discardDraft();
  try {
    repointAlias("--color-success-bg", "--color-success-700");
    const pal = readFileSync(join(DRAFT, "tokens/palette.css"), "utf8");
    assert.match(pal, /--color-success-bg:\s*var\(--color-success-700\)/);
    assert.match(readFileSync(join(DRAFT, "dist/tokens.inline.css"), "utf8"), /--color-success-bg:\s*var\(--color-success-700\)/);
  } finally { discardDraft(); }
});
test("setReference swaps a component property's token in draft primitives.css", () => {
  discardDraft();
  try {
    setReference({ layer:"primitive", name:"button", selector:".btn--primary", prop:"background-color", fromToken:"--color-primary-700", toToken:"--color-primary-600" });
    const prim = readFileSync(join(DRAFT, "primitives/primitives.css"), "utf8");
    const block = prim.slice(prim.indexOf(".btn--primary"), prim.indexOf(".btn--primary") + 200);
    assert.match(block, /background-color:\s*var\(--color-primary-600\)/);
  } finally { discardDraft(); }
});
test("setReference targets prop at a declaration boundary, not as a suffix", () => {
  // `radius` is a suffix of `border-radius`. The `.btn` rule has
  // `border-radius: var(--radius-md)` and NO standalone `radius:` property.
  // Without the `(?<![\w-])` left boundary, propRe matches `radius: var(--radius-md)`
  // *inside* `border-radius:` and silently corrupts the wrong declaration. With the
  // boundary, no standalone `radius:` exists so setReference must THROW — and
  // `border-radius:` must stay byte-for-byte untouched.
  discardDraft();
  try {
    assert.throws(
      () => setReference({ layer:"primitive", name:"button", selector:".btn", prop:"radius", fromToken:"--radius-md", toToken:"--radius-lg" }),
      /radius.*not found/
    );
    const prim = readFileSync(join(DRAFT, "primitives/primitives.css"), "utf8");
    const block = prim.slice(prim.indexOf("\n.btn {"), prim.indexOf("\n.btn {") + 400);
    // `border-radius:` was NOT corrupted (still references --radius-md).
    assert.match(block, /border-radius:\s*var\(--radius-md\)/);
  } finally { discardDraft(); }
});
