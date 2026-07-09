# prototype-cheatsheet — 原型速查生成（foundation 侧）

> 为下游 `pep-webapp-docs` 的 `prototype-design` skill 生成"组件用法速查"+ 档位清单,产出落 `release/`、随 tag 发布。下游只读、不再自己生成。

> **省事跑法**：用 `.claude/skills/prototype-cheatsheet/` 这个 skill——说「刷新原型速查」它就把下面的 ①check-staleness → 蒸馏被点名骨架(按 `rules/skeleton-format.md` 契约)→ ②refresh 一条龙跑完(蒸后给你预览确认;不 commit/tag)。下面是它内部等价的手动命令。

## 何时跑
**打 release tag 之前,手动触发一次**（组件/CSS/范例有变时）。这是 foundation 发布流程里加的一步;发布逻辑其余不变。

## 怎么跑（打 tag 前,catalog 重建之后）
```bash
# 从 foundation 仓库根
# ① 先查骨架陈旧(范例变了但骨架没重蒸馏)——确定性哈希 diff,非零退出=有待修
node scripts/prototype-cheatsheet/check-staleness.mjs
#   报「陈旧」的组件 → 重蒸馏其 skeletons/<name>.md(读 primitives|composites/<name>.html)→ 跑 --update 落基线
#   报「缺骨架」的组件 → 补一份骨架 → --update
# ② 再生成(读现有骨架 + registry + catalog → 三档速查 + tier-components)
node scripts/prototype-cheatsheet/refresh.mjs
```
> 顺序要点:**check-staleness 在 refresh 之前**。refresh 只重拼、不重蒸馏骨架,所以必须先靠 check-staleness 点名过期骨架、重蒸馏,否则 refresh 会把旧骨架静默烘进速查。

产出（提交进本次 release(release/prototype-cheatsheet/)、随 tag 走）:
- `release/prototype-cheatsheet/cheatsheet-low.md` / `-mid.md` / `-full.md` — 三档组件用法速查（class + 最小 markup 骨架）
- `release/prototype-cheatsheet/tier-components.json` — 三档组件清单（下游按它建壳 `build-netshell --components/--primitives`）

档累积:`低30 ⊂ 中70 ⊂ 高100`。

## 源（本目录 + 脚本）
- `prototype-cheatsheet/component-registry.md` — **档位策略唯一手调源**:每组件标 `30`/`70`/`100`。改档位 = 改这里 → 重跑 refresh。
- `prototype-cheatsheet/skeletons/<组件>.md` — 每组件一份最小 markup 骨架（从 `primitives|composites/<组件>.html` 蒸馏）。**新增组件**:登记表加行 + 补一份骨架 → 重跑。
- `scripts/prototype-cheatsheet/refresh.mjs`（+ `lib/`）— 生成器:读登记表 + 骨架 + `release/catalog.json` 名字 → 拼速查 + tier-components + 跑 marker 覆盖守卫。

## marker 覆盖守卫（重要）
refresh 会检查:每个档位 T 的组件,其 CSS 必须能被 `build-netshell` 按 `/* @component <name> */` 标记切进 T 档壳。
- **报 error** = 某组件 CSS 只落在**更高档**组件的标记块里（如曾经的 `input-group` 落在 `hover-card@100` 块内）→ 该组件在 T 档壳无 CSS、会破版。**修法**:在 `primitives/composites` CSS 里给它加独立 `/* @component <name> */` 标记,或把它降到 host 所在档。
- **warn(markerless but safe)** = 无独立标记但 host 档 ≤ 自身档,暂安全。

## 与下游的接口
下游 `pep-webapp-docs` 按最新 tag `checkout` foundation 后,只读 `release/prototype-cheatsheet/cheatsheet-*.md` + `release/prototype-cheatsheet/tier-components.json`。**下游不持有登记表/骨架/生成器**;档位与速查内容都由本目录决定。
