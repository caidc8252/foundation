import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "parse5";
import { elementChildren, resolveRelPath, classTokens } from "./composite-slot.mjs";

function firstByClass(doc, cls) {
  const stack = [doc];
  while (stack.length) {
    const n = stack.shift();
    if (n.attrs && classTokens(n).includes(cls)) return n;
    for (const c of n.childNodes || []) stack.push(c);
  }
  return null;
}

test("resolveRelPath walks element children only, skipping text nodes", () => {
  const html = `<div class="page-header">
    <div class="page-header__title">T</div>
    <div class="page-header__actions">
      <button class="btn btn--secondary">A</button>
      <button class="btn btn--ghost">B</button>
    </div>
  </div>`;
  const doc = parse(html);
  const root = firstByClass(doc, "page-header");
  // 元素子节点:index 0 = __title, 1 = __actions; __actions 的元素子节点 0/1 = 两个按钮
  const secondary = resolveRelPath(root, "1.0");
  const ghost = resolveRelPath(root, "1.1");
  assert.ok(classTokens(secondary).includes("btn--secondary"));
  assert.ok(classTokens(ghost).includes("btn--ghost"));
});

test("resolveRelPath returns null for out-of-range path", () => {
  const doc = parse(`<div class="c"><span></span></div>`);
  assert.equal(resolveRelPath(firstByClass(doc, "c"), "5"), null);
});
