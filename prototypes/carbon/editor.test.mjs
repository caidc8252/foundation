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

test("visual review speaks in visible objects and global source targets", () => {
  assert.match(editorSource, /mkbtn\('视觉审查'/);
  assert.match(editorSource, /function visualLabelForOwner\(owner\)/);
  assert.match(editorSource, /function targetSourceForOwner\(owner\)/);
  assert.match(editorSource, /这是一个全局组件样式修改/);
  assert.match(editorSource, /会写入：/);
  assert.match(editorSource, /会影响所有使用/);
  assert.match(editorSource, /composites\/composites\.css/);
  assert.match(editorSource, /primitives\/primitives\.css/);
});

test("visual review never offers local scope choices or internal component labels", () => {
  assert.ok(!editorSource.includes("只改这个页面"));
  assert.ok(!editorSource.includes("本页同类"));
  assert.ok(!editorSource.includes("所有页面同类"));
  assert.ok(!editorSource.includes("设为评审目标"));
  assert.ok(!editorSource.includes("composite ·"));
  assert.ok(!editorSource.includes("primitive ·"));
});

test("visual review drafts are selector scoped global class changes", () => {
  assert.match(editorSource, /var classStore\s*=\s*\{\}/);
  assert.match(editorSource, /function renderClassDraftStyle\(\)/);
  assert.match(editorSource, /collectClassOverrides\(\)[\s\S]*classStore/);
  assert.match(editorSource, /payload[\s\S]*reviewSubject:\s*currentReviewSubject/);
});

test("visual review drafts survive initial version application", () => {
  assert.match(editorSource, /if \(!preserveDraft\) clearDraftOverrides\(\)/);
  assert.match(editorSource, /applyVersion\(chosen, false, \{ preserveDraft: !preferred \}\)/);
  assert.match(editorSource, /if \(preserveDraft\) renderClassDraftStyle\(\)/);
});

test("save preview labels each selector with its own visible object", () => {
  assert.doesNotMatch(editorSource, /reviewLabel:\s*currentReviewSubject/);
  assert.match(editorSource, /var subject = visualSubjectForElement\(el, cls\)/);
  assert.match(editorSource, /function reviewSummaryFromCollected\(collected\)/);
  assert.match(editorSource, /本次包含：/);
});

test("ancestor chips use the original class and owner labels", () => {
  assert.match(editorSource, /function ownerLabel\(owner\)/);
  assert.match(editorSource, /Composite '\s*:\s*'Primitive '/);
  assert.match(editorSource, /function ancestorChipText\(el\)[\s\S]*return owner \? cls \+ ' · ' \+ ownerLabel\(owner\) : cls;/);
});

test("style editor does not expose a custom CSS value option", () => {
  assert.ok(!editorSource.includes("自定义…"));
  assert.ok(!editorSource.includes("__custom__"));
});
