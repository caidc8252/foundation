# prototype-cheatsheet — 原型组件索引生成（foundation 侧）

> 为下游 `pep-webapp-docs` 的 `prototype-design` skill 生成"组件索引"+ 档位清单,产出落 `release/prototype-cheatsheet/`、随 tag 发布。下游只读、不自己生成。

> **索引化(2026-07)**：产物已从"蒸馏 markup 骨架"改为**纯索引**——组件 class vocab + 用途 + **范例路径**,不含 markup。下游写手对非平凡组件**按范例路径直接读真范例**(`primitives|composites/<name>.html`)取规范实例。因此**骨架库 + 蒸馏 + 陈旧检查(check-staleness) 全部退役**;索引恒从 `release/catalog.json`(由 `pnpm build` 自动生成)派生,零蒸馏维护。

## 何时跑
**打 release tag 之前,手动触发一次**（组件/档位有变时）。这是 foundation 发布流程里加的一步;发布逻辑其余不变。

## 怎么跑（打 tag 前,catalog 重建之后）
```bash
# 从 foundation 仓库根,release 构建(pnpm build,生成 catalog.json)之后：
node scripts/prototype-cheatsheet/refresh.mjs
```
> 前置:`release/catalog.json` 已是最新(refresh 从它取每个组件的 summary/classes/example/layer)。refresh 不重建 release,只读 catalog + registry 拼索引。

产出（提交进本次 release(`release/prototype-cheatsheet/`)、随 tag 走）:
- `release/prototype-cheatsheet/cheatsheet-{low,mid,full}.md` — 三档**组件索引**（class vocab + 用途 + 范例路径;无 markup）
- `release/prototype-cheatsheet/tier-components.json` — 三档组件清单（下游按它建壳 `build-netshell --components/--primitives`）

档累积:`低30 ⊂ 中70 ⊂ 高100`。

## 源
- `prototype-cheatsheet/component-registry.md` — **档位策略唯一手调源**:每组件标 `30`/`70`/`100`。改档位 = 改这里 → 重跑 refresh。新增组件只需在这里加一行(vocab/用途/范例路径由 catalog 自动带出)。
- `release/catalog.json` — 组件事实(名字/vocab/用途/范例路径),由 `pnpm build` 生成,refresh 只读。
- `scripts/prototype-cheatsheet/refresh.mjs`（+ `lib/registry.mjs` `lib/catalog.mjs` `lib/marker-coverage.mjs`）— 生成器。

> **已退役**(索引化后不再使用,可删):`prototype-cheatsheet/skeletons/`、`.skeleton-baseline.json`、`scripts/prototype-cheatsheet/check-staleness.mjs`、`scripts/prototype-cheatsheet/lib/skeletons.mjs`、`.claude/skills/prototype-cheatsheet/rules/skeleton-format.md`。删除前确认无其它引用。

## marker 覆盖守卫（保留）
refresh 仍检查:每个档位 T 的组件,其 CSS 必须能被 `build-netshell` 按 `/* @component <name> */` 标记切进 T 档壳。
- **报 error** = 某组件 CSS 只落在**更高档**组件的标记块里 → 该组件在 T 档壳无 CSS、会破版。**修法**:在 `primitives/composites` CSS 里给它加独立 `/* @component <name> */` 标记,或把它降到 host 所在档。
- **warn(markerless but safe)** = 无独立标记但 host 档 ≤ 自身档,暂安全。

## 与下游的接口
下游 `pep-webapp-docs` 按最新 tag `checkout` foundation 后,只读 `release/prototype-cheatsheet/cheatsheet-*.md`(索引) + `tier-components.json`,并按索引里的**范例路径**按需读 `primitives|composites/<name>.html` 真范例。**下游不持有登记表/生成器**;档位与索引内容都由本目录决定。
