import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "parse5";
import { elementChildren, resolveRelPath, classTokens, materializeIntoHtml } from "./composite-slot.mjs";

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

const TWO_INSTANCES = `<section class="page-header"><div class="page-header__actions"><button class="btn btn--secondary">A</button></div></section>
<section class="page-header"><div class="page-header__actions"><button class="btn btn--secondary">B</button></div></section>`;

test("materializeIntoHtml swaps the class at the slot path in EVERY instance", () => {
  const ov = [{ composite: "page-header", rootClass: ".page-header", path: "0.0", classSwaps: { variant: { from: "btn--secondary", to: "btn--primary" } } }];
  const { html, stats } = materializeIntoHtml(TWO_INSTANCES, ov);
  assert.equal(stats.matched, 2);
  assert.equal(stats.changed, 2);
  assert.equal((html.match(/btn--primary/g) || []).length, 2);
  assert.ok(!html.includes("btn--secondary"));
  // 只改了 class 段,其余文本保留
  assert.ok(html.includes(">A<") && html.includes(">B<"));
});

test("materializeIntoHtml skips instances whose target lacks the from-class, and is idempotent", () => {
  const mixed = `<section class="page-header"><div class="page-header__actions"><button class="btn btn--secondary">A</button></div></section>
<section class="page-header"><div class="page-header__actions"><button class="btn btn--ghost">B</button></div></section>`;
  const ov = [{ composite: "page-header", rootClass: ".page-header", path: "0.0", classSwaps: { variant: { from: "btn--secondary", to: "btn--primary" } } }];
  const once = materializeIntoHtml(mixed, ov);
  assert.equal(once.stats.changed, 1);
  assert.equal(once.stats.skipped, 1);
  const twice = materializeIntoHtml(once.html, ov);
  assert.equal(twice.stats.changed, 0);            // 幂等:已改的不再改
  assert.equal(twice.html, once.html);
});

test("materializeIntoHtml merges multiple swap groups on the same element", () => {
  const html = `<div class="card"><button class="btn btn--secondary btn--md">X</button></div>`;
  const ov = [{ composite: "card", rootClass: ".card", path: "0", classSwaps: { variant: { from: "btn--secondary", to: "btn--primary" }, size: { from: "btn--md", to: "btn--sm" } } }];
  const { html: out } = materializeIntoHtml(html, ov);
  assert.ok(out.includes("btn--primary") && out.includes("btn--sm"));
  assert.ok(!out.includes("btn--secondary") && !out.includes("btn--md"));
});
