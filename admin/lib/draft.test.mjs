import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, rmSync } from "node:fs";
import { ROOT, DRAFT, activeRoot } from "./paths.mjs";
import { ensureDraft, draftExists, discardDraft, buildDraftTokens } from "./draft.mjs";
import { join } from "node:path";

test("emit CLI output unchanged after refactor", () => {
  const outputs = [
    "build/current/tokens.inline.css",
    "build/current/primitives.css",
    "build/current/composites.css",
    "build/current/manifest.json",
    "release/catalog.json",
    "release/catalog.md",
    "release/tokens.json",
  ];
  execFileSync("node", [join(ROOT, "emit/build.mjs")], { cwd: ROOT });
  const before = outputs.map((f) => readFileSync(join(ROOT, f), "utf8"));
  execFileSync("node", [join(ROOT, "emit/build.mjs")], { cwd: ROOT });
  outputs.forEach((f, i) => {
    const after = readFileSync(join(ROOT, f), "utf8");
    assert.equal(after, before[i], `${f} output must be byte-identical`);
  });
});
test("ensureDraft copies the editable inputs; activeRoot switches", () => {
  discardDraft();
  assert.equal(draftExists(), false);
  assert.equal(activeRoot(), ROOT);
  ensureDraft();
  assert.ok(existsSync(join(DRAFT, "tokens/palette.css")));
  assert.ok(existsSync(join(DRAFT, "primitives/primitives.css")));
  assert.ok(existsSync(join(DRAFT, "composites/composites.css")));
  assert.equal(activeRoot(), DRAFT);
  buildDraftTokens();
  assert.match(readFileSync(join(DRAFT, "dist/tokens.inline.css"), "utf8"), /--color-primary-700/);
  discardDraft();
  assert.equal(draftExists(), false);
});
