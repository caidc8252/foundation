// Authoritative implementation of the composite-slot relative-path contract on
// the foundation side. Mirrors carbon/editor.js: indices among ELEMENT children
// only (parse5 childNodes include text/comment nodes — filter them out).

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
