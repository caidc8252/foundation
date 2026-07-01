import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const editorSource = readFileSync(join(here, "editor.js"), "utf8");

test("version control does not render the applied-version status text in the header", () => {
  assert.doesNotMatch(editorSource, /wrap\.appendChild\(versionStatus\)/);
});

test("style editor does not expose a custom CSS value option", () => {
  assert.ok(!editorSource.includes("自定义…"));
  assert.ok(!editorSource.includes("__custom__"));
});
