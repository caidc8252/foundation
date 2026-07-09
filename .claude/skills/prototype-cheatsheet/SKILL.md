---
name: prototype-cheatsheet
description: |
  发布"原型速查"素材(供下游 pep-webapp-docs 的 prototype-design skill 消费)。
  一句话跑完:骨架陈旧检查 → 蒸馏被点名的骨架(按格式契约)→ refresh 重生三档速查 + tier-components 到 release/prototype-cheatsheet/。
  **何时用**:foundation 打 release tag 前(release 已构建之后),维护者说「刷新原型速查 / 发布原型速查 / prototype-cheatsheet」时触发。
  本 skill 只做"检查+蒸馏+refresh";release 构建与 git commit/tag 是 foundation 自己的发布流程,skill 不碰。
---

# prototype-cheatsheet · 原型速查发布(薄流程)

> **引用**：
> - `rules/skeleton-format.md` — 骨架蒸馏契约(格式 + 铁律 + 配方)的唯一主家。
> - 复用脚本(已在仓库):`scripts/prototype-cheatsheet/check-staleness.mjs`、`scripts/prototype-cheatsheet/refresh.mjs`。
> - 源:`prototype-cheatsheet/{component-registry.md, skeletons/, .skeleton-baseline.json}`。产物:`release/prototype-cheatsheet/`。
> 详细背景见 `prototype-cheatsheet/README.md`。

本 skill 只自动化 foundation 发布流程的**第 2–3 步**:

```
(1) foundation 构建 release   —— foundation 自己做,不在本 skill
(2) 骨架陈旧检查 + 必要时蒸馏  ┐
(3) refresh → release/prototype-cheatsheet/  ┘ ← 本 skill
(4) git commit + 打 tag       —— foundation 自己做,不在本 skill
```

## 流程

### 步骤 1 · 前置检查
确认 `release/catalog.json` 存在(refresh 读它)。不存在 / 明显过期 → **提醒维护者先跑 foundation 的 release 构建**,不硬闯、不自行构建 release。

### 步骤 2 · 跑骨架陈旧检查
```bash
node scripts/prototype-cheatsheet/check-staleness.mjs
```
解析输出三类:**陈旧**(范例变了、骨架需重蒸馏)、**缺骨架**(已纳入档位却没骨架)、**孤儿**(骨架有、源范例没了)。

- 三类皆空 → 跳到步骤 5(直接 refresh)。
- 有陈旧/缺骨架 → 步骤 3。
- 孤儿 → 步骤 3 处理其余的同时,**报给维护者裁定**(组件是否已删?删则移除 `skeletons/<name>.md` + `component-registry.md` 对应行)——**不自动删**。

### 步骤 3 · 蒸馏被点名的骨架（按 `rules/skeleton-format.md`）
对每个"陈旧 / 缺骨架"组件,**主线程 inline 蒸馏**(通常一次 release 就一两个,量小,不派子代理):
- 读 `primitives/<name>.html` 或 `composites/<name>.html`(源范例);
- 严格按 `rules/skeleton-format.md` 的格式 + 铁律 + 配方,产出最小骨架;
- 覆写 `prototype-cheatsheet/skeletons/<name>.md`。

### 步骤 4 · 预览 + 确认
把本轮蒸出的骨架内容(或 diff)呈给维护者,**等确认**。未确认不落基线、不 refresh。

### 步骤 5 · 落基线 + refresh
确认后(或步骤 2 三类皆空):
```bash
node scripts/prototype-cheatsheet/check-staleness.mjs --update   # 重记源范例哈希基线
node scripts/prototype-cheatsheet/refresh.mjs                     # 重生 release/prototype-cheatsheet/
```
- refresh 报 **marker-coverage error**(某档组件 CSS 只落在更高档 `@component` 标记块内)→ **升级维护者**:需在 `primitives|composites` CSS 补 `/* @component <name> */` 标记(foundation 源修),再重跑。`warn(markerless but safe)` → 放行。

### 步骤 6 · 报告 + 交回 foundation
- 报告:重蒸了哪些骨架、refresh 的三档组件数、marker-coverage 结果。
- **收尾提示**(不代做):请维护者 `git commit`(改动的 `skeletons/` + `.skeleton-baseline.json` + `release/prototype-cheatsheet/`)并按 foundation 流程 **打 tag**。下游按最新 tag 只读。

## 边界
- 只碰 `prototype-cheatsheet/`(源 + 骨架 + 基线)与经脚本产出的 `release/prototype-cheatsheet/`;**不构建 release、不 commit、不打 tag、不改下游**。
- 蒸馏是判断活,严格遵 `rules/skeleton-format.md`;检查/refresh 是确定性脚本,直接跑。
- 缺骨架量大/频繁时才考虑派蒸馏子代理(当前 inline;YAGNI)。
