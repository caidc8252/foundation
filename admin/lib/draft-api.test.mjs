import { test } from "node:test";
import assert from "node:assert/strict";
import { discardDraft, draftStatus } from "./draft.mjs";
import { setTokenValue } from "./edit.mjs";
import { renderComponent } from "./render.mjs";
import { recipeFor } from "./recipe.mjs";

test("edit reflects in render + recipe; discard reverts", () => {
  try {
    discardDraft();
    const before = renderComponent("primitive", "button");
    assert.match(before, /--color-primary-700:\s*oklch\(24% 0\.06\s+262\)/);
    setTokenValue("--color-primary-700", "oklch(50% 0.2 20)");
    assert.equal(draftStatus().exists, true);
    assert.equal(draftStatus().changes.length, 1);
    const after = renderComponent("primitive", "button");
    assert.match(after, /--color-primary-700:\s*oklch\(50% 0\.2 20\)/);
    assert.ok(recipeFor("primitive","button").groups.color.some(u=>u.token==="--color-primary-700"));
    discardDraft();
    const reverted = renderComponent("primitive", "button");
    assert.match(reverted, /--color-primary-700:\s*oklch\(24% 0\.06\s+262\)/);
  } finally {
    discardDraft();
  }
});
