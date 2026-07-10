---
name: prototype-cheatsheet
description: |
  发布"原型组件索引"素材(供下游 pep-webapp-docs 的 prototype-design skill 消费)。
  一句话跑完:从 registry + catalog 生成三档组件索引 + tier-components 到 release/prototype-cheatsheet/。
  **何时用**:foundation 打 release tag 前(release 已构建、catalog.json 已最新之后),维护者说「刷新原型速查 / 发布原型索引 / prototype-cheatsheet」时触发。
  本 skill 只做 refresh;release 构建与 git commit/tag 是 foundation 自己的发布流程,skill 不碰。
---

# prototype-cheatsheet · 原型组件索引发布(薄流程)

> **索引化(2026-07)**：产物已是**纯索引**(class vocab + 用途 + 范例路径,无 markup 骨架)。下游写手非平凡组件按范例路径直接读真范例。因此**骨架蒸馏 + 陈旧检查已退役**——本 skill 不再做蒸馏,只跑确定性的 refresh。
>
> **引用**：
> - 生成器(已在仓库):`scripts/prototype-cheatsheet/refresh.mjs`(+ `lib/registry.mjs` `lib/catalog.mjs` `lib/marker-coverage.mjs`)。
> - 源:`prototype-cheatsheet/component-registry.md`(档位) + `release/catalog.json`(组件事实)。产物:`release/prototype-cheatsheet/`。
> 详细背景见 `prototype-cheatsheet/README.md`。

本 skill 只自动化 foundation 发布流程的**第 2 步**:

```
(1) foundation 构建 release(pnpm build → catalog.json)  —— foundation 自己做,不在本 skill
(2) refresh → release/prototype-cheatsheet/            ← 本 skill
(3) git commit + 打 tag                                —— foundation 自己做,不在本 skill
```

## 流程

### 步骤 1 · 前置检查
确认 `release/catalog.json` 存在且是最新(refresh 从它取每个组件的 summary/classes/example/layer)。不存在 / 明显过期 → **提醒维护者先跑 foundation 的 release 构建(`pnpm build`)**,不硬闯、不自行构建 release。

### 步骤 2 · 跑 refresh
```bash
pnpm cheatsheet
```
- 从 `component-registry.md`(档位) + `catalog.json`(组件事实) 生成三档索引 `cheatsheet-{low,mid,full}.md` + `tier-components.json` 到 `release/prototype-cheatsheet/`。
- refresh 报 **marker-coverage error**(某档组件 CSS 只落在更高档 `@component` 标记块内)→ **升级维护者**:需在 `primitives|composites` CSS 补 `/* @component <name> */` 标记(foundation 源修),再重跑。`warn(markerless but safe)` → 放行。

### 步骤 3 · 报告 + 交回 foundation
- 报告:三档索引的组件数、marker-coverage 结果。
- **收尾提示**(不代做):请维护者 `git commit`(改动的 `release/prototype-cheatsheet/`)并按 foundation 流程 **打 tag**。下游按最新 tag 只读。

## 新增/改档组件
只在 `prototype-cheatsheet/component-registry.md` 加行 / 改档位标记 → 重跑 refresh。vocab/用途/范例路径由 catalog 自动带出,**无需蒸馏骨架**。

## 边界
- 只碰经脚本产出的 `release/prototype-cheatsheet/`(+ 手调 `component-registry.md` 档位);**不构建 release、不 commit、不打 tag、不改下游**。
- refresh 是确定性脚本,直接跑。**已无蒸馏这类判断活**。

## 已退役
索引化后不再使用(可删):`prototype-cheatsheet/skeletons/`、`.skeleton-baseline.json`、`scripts/prototype-cheatsheet/check-staleness.mjs`、`scripts/prototype-cheatsheet/lib/skeletons.mjs`、`rules/skeleton-format.md`。
