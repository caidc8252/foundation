// Authoritative implementation of the composite-slot relative-path contract on
// the foundation side. Mirrors carbon/editor.js: indices among ELEMENT children
// only (parse5 childNodes include text/comment nodes — filter them out).

import { parse } from "parse5";

export function elementChildren(node) {
  return (node.childNodes || []).filter((c) => typeof c.tagName === "string");
}

export function resolveRelPath(rootNode, path) {
  if (path === "") return rootNode || null;
  let node = rootNode;
  for (const seg of path.split(".")) {
    if (!node) return null;
    node = elementChildren(node)[Number(seg)];
  }
  return node || null;
}

export function classTokens(node) {
  const attr = (node.attrs || []).find((a) => a.name === "class");
  return attr ? attr.value.trim().split(/\s+/).filter(Boolean) : [];
}

function walk(node, visit) {
  visit(node);
  for (const c of node.childNodes || []) walk(c, visit);
}

// Locate every element bearing an override's rootClass, resolve its slot path
// to a target node, and aggregate all swap-groups touching that target so
// each target produces exactly ONE surgical splice of its class attribute
// (multiple groups on the same element must not race against each other).
export function materializeIntoHtml(html, overrides) {
  const doc = parse(html, { sourceCodeLocationInfo: true });
  const stats = { matched: 0, changed: 0, skipped: 0 };
  const byNode = new Map(); // target node -> { loc, tokens }
  for (const ov of overrides) {
    const rootCls = ov.rootClass.replace(/^\./, "");
    walk(doc, (node) => {
      if (!node.attrs || !classTokens(node).includes(rootCls)) return;
      const target = resolveRelPath(node, ov.path);
      if (!target) { stats.skipped++; return; }
      stats.matched++;
      const loc = target.sourceCodeLocation && target.sourceCodeLocation.attrs && target.sourceCodeLocation.attrs.class;
      if (!loc) { stats.skipped++; return; }
      const rec = byNode.get(target) || { loc, tokens: classTokens(target) };
      let touched = false;
      for (const [, sw] of Object.entries(ov.classSwaps)) {
        const i = rec.tokens.indexOf(sw.from);
        if (i >= 0) { rec.tokens[i] = sw.to; touched = true; }
      }
      if (touched) { byNode.set(target, rec); } else { stats.skipped++; }
    });
  }
  const splices = [...byNode.values()].map((r) => ({ start: r.loc.startOffset, end: r.loc.endOffset, value: `class="${r.tokens.join(" ")}"` }));
  splices.sort((a, b) => b.start - a.start);
  let out = html;
  for (const sp of splices) out = out.slice(0, sp.start) + sp.value + out.slice(sp.end);
  stats.changed = splices.length;
  return { html: out, stats };
}
