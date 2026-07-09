// scripts/build-netshell.mjs
// 从 foundation 的 CSS 切出一个「净壳」：tokens(全) + 选中 primitives + 选中 composites，
// 内联进一个自包含的空壳 HTML（空 <main> 供 builder 写 markup，带 foundation/archetype 双戳）。
// 本工具是 foundation 自身 CSS 的切片器，随 foundation 结构演进维护（切片工具归 foundation）。
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// 本脚本住在 foundation/scripts/ 下，仓库根 = 上一级。--foundation 省略时默认它。
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const MARK = /\/\*\s*@component\s+([a-z0-9-]+)\s*\*\//gi;

export function sliceComponentCss(compositesCss, components) {
  if (components === "all") return compositesCss;
  if (components === "none" || (Array.isArray(components) && components.length === 0)) return "";
  const want = new Set(components);
  const idxs = [];
  let m;
  MARK.lastIndex = 0;
  while ((m = MARK.exec(compositesCss)) !== null) idxs.push({ name: m[1], start: m.index });
  const out = [];
  for (let i = 0; i < idxs.length; i++) {
    const seg = compositesCss.slice(idxs[i].start, i + 1 < idxs.length ? idxs[i + 1].start : undefined);
    if (want.has(idxs[i].name)) out.push(seg.trimEnd());
  }
  return out.join("\n");
}

// CRUD 原型常用的 primitive 家族(核心集 ≈45K, vs 全量 145K)。
export const CORE_PRIMITIVES = [
  "button", "input", "textarea", "select", "checkbox", "radio-group", "field",
  "badge", "card", "separator", "spinner", "progress",
  "modal", "alert", "alert-dialog", "toast", "tabs", "tooltip",
];

export function assembleNetShell({ tokensCss, primitivesCss = "", compositesCss, components, primitives = "all", archetype, tag }) {
  const slicedPrim = sliceComponentCss(primitivesCss, primitives);
  const sliced = sliceComponentCss(compositesCss, components);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- foundation: ${tag} -->
<!-- archetype: ${archetype} -->
<style data-foundation="${tag}">
${tokensCss}
${slicedPrim}
${sliced}
</style>
<style data-page></style>
</head>
<body>
<div class="app-frame app-frame--frameless"><main class="app-frame__main"></main></div>
</body>
</html>
`;
}

function main() {
  const a = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, []));
  const root = a.foundation || REPO_ROOT; // 省略 --foundation 时默认本仓库根
  const tokensCss = readFileSync(join(root, "release/tokens.inline.css"), "utf8");
  const primitivesCss = readFileSync(join(root, "primitives/primitives.css"), "utf8");
  // 读源 composites/composites.css（带 @component 标记，可切段）——与 primitives 一致读源；
  // release/composites.css 是 verbatim 内联版、不带标记，无法切段（见 verify-first 教训）。
  const compositesCss = a.components === "none" ? "" : readFileSync(join(root, "composites/composites.css"), "utf8");
  const components = a.components === "all" || a.components === "none" ? a.components : (a.components || "").split(",").filter(Boolean);
  // --primitives: all(默认, 全量145K) | core(核心集≈45K) | csv(显式家族)
  const primArg = a.primitives || "all";
  const primitives = primArg === "all" ? "all"
    : primArg === "core" ? CORE_PRIMITIVES
    : primArg.split(",").filter(Boolean);
  const html = assembleNetShell({ tokensCss, primitivesCss, compositesCss, components, primitives, archetype: a.archetype || "list-page", tag: a.tag || "dev" });
  writeFileSync(a.out, html);
  console.log(`netshell written: ${a.out} (${html.length} bytes, components=${JSON.stringify(components)}, primitives=${JSON.stringify(primitives).slice(0,60)})`);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
