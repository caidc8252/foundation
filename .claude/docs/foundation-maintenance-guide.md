# Foundation 维护流程指南

> **版本**: 基于 foundation `develop` 分支，2026-06-29（`@cloud/foundation` v0.3.0）
> **定位**: 维护者操作手册 —— 添加 / 删除 / 修改 token · primitive · composite · pattern
> 时，**改哪些文件、按什么顺序、跑哪些校验、如何版本化**的完整清单。
>
> 配套阅读：[`artifact-build-guide.md`](./artifact-build-guide.md)（职责①／消费侧：AI 如何用闭合集生成产物）、
> [`governance/token-change.md`](../../governance/token-change.md)（本指南的上游规范，覆盖 token 与组件的添加）、
> [`governance/principles.md`](../../governance/principles.md)（13 条设计法则）。本指南把 token-change.md
> 重新组织并**扩展到 pattern 与删除/修改**这两类它未充分覆盖的操作；两者口径一致，冲突以 token-change.md 为准。

---

## 目录

1. [先别急着加（reuse-first）](#1-先别急着加reuse-first)
2. [快速参考表](#2-快速参考表)
3. [守卫与版本化](#3-守卫与版本化)
4. [添加 token](#4-添加-token)
5. [添加 primitive](#5-添加-primitive)
6. [添加 composite](#6-添加-composite)
7. [添加 pattern](#7-添加-pattern)
8. [删除](#8-删除)
9. [修改](#9-修改)
10. [同步 editor substrate（foundation-maintain）](#10-同步-editor-substratefoundation-maintain)
11. [附录：文件地图与关键事实](#11-附录文件地图与关键事实)

---

## 1. 先别急着加（reuse-first）

向闭合集添加任何东西，都是**有版本意义的事件**，不是本地小改 —— 它会同时影响两个消费者
（Next.js 应用 `@cloud/ui` 与自包含 artifact）。所以**添加是最后手段**，按以下优先级先排除：

1. **复用现有语义 token / primitive / composite**。要"次要文字"→ 用 `content-secondary`，
   别新增 `content-muted`；要状态徽标 → 用 `badge`，别手搓一个。
2. **复用某个 ramp 色阶步或某个变体**，当没有语义名恰好匹配时。
3. **以上都不存在时**才提案新东西 —— 并说明它加入哪个 group/layer、为什么现有的覆盖不了。

判定标准来自治理法则：一个**当前真实存在的缺口**（某 pattern 需要、但尚不存在的 primitive）
属于"what is"，应该补上；一个**投机性的"将来可能有用"**不属于 —— 见 [`AGENTS.md`](../../AGENTS.md)。
需要闭合集表达不了的视觉？停下来走提案流程，**不要硬编码 hex/px、不要手搓组件**
（法则 #1 / #5）。

> 一切改动只能起源于 foundation 仓库这**一个上游**。在 artifact 里发现的 token/组件需求，
> 仍然是一个**指向 foundation 的 PR** —— 绝不是对内联快照的本地补丁，也不是在 app 侧另开一份分叉值。

---

## 2. 快速参考表

| 操作 | 改哪些文件（源） | 跑哪些校验 | 版本影响 |
|------|------------------|------------|----------|
| **加 token** | `tokens/<layer>.css`（+ `tokens/dark.css` 若暗色变化） → `pnpm build` | `pnpm build` · `check:release` | minor |
| **加 primitive** | `primitives/<name>.md` → `primitives/primitives.css`（含 `/* @component <name> */`）→ 可选 `primitives/<name>.html` → `pnpm build` | `check:release` · `check:examples --strict` | minor |
| **加 composite** | `composites/<name>.md` → `composites/composites.css`（含 marker）→ 可选 `composites/<name>.html` →（若被 pattern 用）`patterns/<pattern>.md` Building blocks + `patterns/router.json` 的 `route.composites` → `pnpm build` | `check:release` · `check:examples --strict` · `check:patterns` | minor |
| **加 pattern** | `patterns/<name>.md` → `patterns/<name>.html`（须含 `.app-frame__main`）→ `patterns/router.json`（新 route + `decisionOrder`）→ `pnpm build` | `check:release` · `check:examples --strict` · `check:patterns` | minor |
| **删 任意一类** | 删源文件 / CSS section+marker / `.html` / 所有 router & 契约引用 → `pnpm build` | `check:release` · `check:examples --strict` · `check:patterns` | **major**（移除是破坏性的） |
| **改 token 值** | `tokens/<layer>.css`（+ `dark.css`）→ `pnpm build`；同步两个消费者 | `check:release` · `check:examples --strict` | 改值若位移现有 UI → **major** |
| **改契约 / 改类名** | `.md` + `.css`（+ marker）+ `.html` + 任何 example 一起改 → `pnpm build` | 全部 `check:all` | 破坏性契约改动 → **major** |
| **promote 原型版本** | `versions/vN/manifest.json` → `node scripts/promote-version.mjs vN` 生成 Agent brief → 改真实 source `.css/.md/.html` + 同步 `cloud-next-scaffold/packages/ui` → `pnpm build` | 全部 `check:all` + cloud 仓 `pnpm lint` / `pnpm test` | 取决于实际 source 改动 |

> `pnpm build` = `node emit/build.mjs`。校验脚本对应：`check:build` = `node --test emit/build.test.mjs`，
> `check:promote` = `node --test scripts/promote-version.test.mjs`，
> `check:release` = `node scripts/check-release.mjs`，
> `check:examples` = `node scripts/check-examples.mjs`，`check:patterns` = `node scripts/check-pattern-router.mjs`。
> 一次跑全部：`pnpm check:all`（= `check:build && check:promote && check-release && check-examples --strict && check-pattern-router`）。

> **别忘了下游**：上表任一操作改动了闭合集（加 / 删 / 改契约 / 重命名 class）后，除了同步两个消费者，还要把新 catalog 重新导出给可视化 editor —— 见 [§10 同步 editor substrate](#10-同步-editor-substratefoundation-maintain)。

---

## 3. 守卫与版本化

### 3.1 `release/` 是完全生成的 —— 永不手编

`release/` 由 `pnpm build`（`emit/build.mjs`）从源文件整体生成，包含四个产物：

| 产物 | 由谁生成 |
|------|----------|
| `release/tokens.inline.css` | `tokens/*.css` 八个 layer 文件级联，唯一变换是 `@theme {` / `@theme static {` → `:root {`；其余（`var()`、`color-mix`、暗色块、reduced-motion 媒体查询）原样透传 |
| `release/tokens.json` | 同源，拆成 `{ light, dark }` 两张扁平 map（`motion.css` 的 reduced-motion `@media` 段被排除，light 保留真实时长） |
| `release/catalog.json` | 机器可读闭合集：token 名（取自 light map）+ **精确 class 白名单**（从 `primitives.css` + `composites.css` 抽取的全部 `.x` 选择器）+ 每个契约 `.md` 一条的 per-component 索引（含**自动派生**的 class 列表） |
| `release/catalog.md` | 上者的人类可读镜像 |

**per-component 的 class 列表是从 CSS 派生的，不是手写的。** `emit/build.mjs` 这样做（见
`sectionClassMap` + `componentClasses`）：

1. 用 `═══ … ═══` section header 把 CSS 切成段；
2. 每段紧跟 header 的 `/* @component <slug> */` marker 把**整段的所有 class** 归给该 slug
   （`slug` = 契约 `.md` 的文件名）；
3. 外加一层 BEM 兜底：任何 `slug` / `slug__x` / `slug--x` 形态的 class 无论在哪都归给它。

所以一个组件的 base、`__elements`、`--modifiers`、**以及无命名前缀的卫星 class**（如
`data-table` 拥有 `.cell-num` / `.col-select` / `.table-frame`；`list-filter` 拥有
`.condition-band` / `.search-input` / `.filter-chip`）只要都写在那一段里，catalog 就自动收录。
**这就是为什么不要手编 release/** —— 手写的 per-component 列表过去会漂移（组件声明 7 个 class、
自己的示例却用了 20 个），现已废除（连同被删的 `composites/schema.json`）。

> **历史提示**：曾经存在的 `composites/schema.json` 已被**删除**。任何步骤都**不要**再去维护它。

**`build/current/` 是 `release/` 的姊妹快照 —— 别搞混。** 两者都由 `pnpm build` 从源生成、都永不手编，定位不同：

- `release/` = **对外发布的闭集契约**（含 `catalog.*` / `tokens.json`），artifact 与 foundation-maintain 消费它。
- `build/current/`（`tokens.inline.css` / `primitives.css` / `composites.css` / `manifest.json`）= **「当前源码此刻编译成什么」的预览态**：每次 `pnpm build` 刷新、跟着 HEAD 源走、无 catalog，是原型/审查里那个 `current` 版本的底。它被提交进仓库有两个作用——① PR 里能直接看到源码改动**编译出的 CSS diff**（token 源是 Tailwind 风味的 `@theme`，不是能直接读的最终 CSS）；② `check-release` 用它做守卫：clean rebuild 后 `git diff -- release build/current` 必须为空，抓「手编了生成快照」或「改了源忘了 build」。

### 3.2 三道守卫（每个 PR 前 + CI 都跑）

CI 在 `.github/workflows/checks.yml` 里对 `main` / `develop` 的 push 和所有 PR 跑这三道。
它们都是纯 `node` 脚本，零依赖、无安装步骤：

| 命令 | 它断言什么 | 它如何抓到漏改 |
|------|------------|----------------|
| `node scripts/check-release.mjs` | 重新 build 后 `git diff -- release build/current` 为空 | 抓到**手编了 release/ 或 build/current/** 或**忘了 `pnpm build`**：生成快照与源不一致即 FAIL |
| `node scripts/check-examples.mjs --strict` | 对 `patterns/` · `composites/` · `primitives/` 下每个 `.html` 跑 `check-artifact.mjs --strict` | 抓到 example 用了**闭合集外的 class**、硬编码颜色、未知 token、未知/被篡改的图标。删了某 class 后仍有 example 引用它 → FAIL |
| `node scripts/check-pattern-router.mjs` | `router.json` ↔ `release/catalog.json` ↔ pattern 契约三方对齐 | 每条 route 的 `pattern` 必须是已知 catalog pattern、`contract` 路径必须等于 catalog 记录、`builderPattern` 对应的 `.html` 必须存在、且 **`route.composites` 的每个名字既要是真实 catalog composite、又要在该 pattern 契约 `.md` 里被提及**；任一不满足 → FAIL |

另外，消费侧产物用 `node scripts/check-artifact.mjs [--strict] <file>` 校验（它读
`release/catalog.json` 作闭合集）—— 维护者改完 foundation 后，`check:examples` 已经替你把所有
in-repo example 过了一遍这道关。

### 3.3 版本化规则

`@cloud/foundation` 走 SemVer（当前 `package.json` 为 `0.3.0`）：

- **minor bump**：**添加** token / primitive / composite / pattern（纯增量，老消费者不破）。
- **major bump**：① 改某个 token **值**且会**位移现有 UI**；② **破坏性契约改动**（删除、重命名、
  改变变体/插槽语义）。在 PR 里**显式标注**这是 major。
- **契约优先于实现**（法则 #5）：`.md` 契约赢过任一实现（React `@cloud/ui` 与 artifact 的
  参考 CSS）。当实现与契约不符，是**实现**有 bug。改契约时，两个消费者都要按新契约同步。
- 合并后**打 tag（`vX.Y.Z`）**；每个消费者按自己的节奏 bump 依赖 ref 来同步。

### 3.4 Prototype editor 版本 promote（Agent handoff）

可视化 editor 现在住在独立仓库 [`foundation-maintain`](https://github.com/Newland-Payment-Technology-US-Co-Ltd/foundation-maintain)（`pnpm serve`）。它保存出来的是 `versions/vN/` 快照（`pnpm serve` 本地直接生成，或下载 `manifest.json` 后经 `pnpm apply-draft` 落成 `versions/vN`），不是 governed source。
它会把视觉编辑写进 `versions/vN/manifest.json`：

- `tokenOverrides`：token 值候选改动；
- `classOverrides`：primitive/composite selector 的声明候选改动；
- `classOverrideMeta` / `changes`：selector、prop、旧值、新值，以及它属于哪个 primitive/composite。
- `elementOverrides`：实例级变体/尺寸切换（按 element path 记录 `classSwaps`）。归一化后随 manifest 走完整条链路，但本轮 foundation 侧**只记录、不自动回写页面 HTML**。

**这些 override 是候选事实，不是 foundation 合约。** 尤其是 composite class override：
如果 `.stat-card` 的背景从 `success` 改到 `error`，但 `composites/stat-card.md`
仍写原来的状态/语义，`release/` 就会和契约打架。因此流程是：

1. **保存版本**：在 prototype editor 里保存，得到 `versions/vN/manifest.json`。
   manifest 同时记录当前受管 source 的 Git commit（`sourceCommit` /
   `sourceGit`）。如果保存时 `tokens/`、`primitives/`、`composites/`、
   `patterns/`、`governance/` 有未提交改动，manifest 会标记 `sourceDirty`；
   这种版本不能精确自动恢复 source，先 commit 或清理 source 再保存。
2. **生成 Agent brief**：

   ```bash
   node scripts/promote-version.mjs vN
   # 等价:
   pnpm promote -- vN
   ```

   默认写出 `versions/vN/promote.md`；需要只看内容可用
   `node scripts/promote-version.mjs vN --stdout`。
3. **Agent 读 brief 后改真实 source**，不是改 `release/` / `build/current/` / `versions/vN/`：
   - token 值候选 → `tokens/*.css`（必要时同步 `tokens/dark.css`）；
   - primitive 候选 → `primitives/primitives.css` + `primitives/<name>.md`
     + 必要的 `primitives/<name>.html`；
   - composite 候选 → `composites/composites.css` + `composites/<name>.md`
     + 必要的 `composites/<name>.html`。
4. **Agent 要判断语义**：纯视觉调参可以同步 CSS 与描述；语义变化（如 success → error）
   必须同步契约语言和示例；看起来破坏语义的改动应停下说明，而不是硬塞进 source。
5. **重建与验证**：

   ```bash
   pnpm build
   pnpm check:all
   ```

   运行 `pnpm check:all` 前，先把 promote 的 source 文件和重新生成的 `release/` /
   `build/current/` 快照纳入本次 PR 的 staged set；否则 `check:release` 会正确地报告
   生成快照尚未进入提交。
6. **Agent 自动创建两个 PR 落地 promote 后的 source 与 React 实现**：Agent 创建 foundation
   promotion 分支、只提交本次 promote 的 source 与生成快照、push，并用 `gh pr create`
   打开 foundation PR；同时在 `cloud-next-scaffold` 创建 companion 分支，按 brief 的
   `cloud-next-scaffold UI sync` 段同步 `packages/ui` 的 React/Tailwind 实现，验证后打开
   cloud UI PR。两个 PR 互相写入链接，并把两个 URL 回复给请求者。不要把“手动开 PR”
   留给请求者，也不要直接提交到请求者当前分支；foundation promotion PR 合并后，
   clean 版本才能记录一个可恢复的 Git commit。
7. **把 `vN` 转为 clean 版本**：PR 合并后运行：

   ```bash
   pnpm finalize -- vN
   ```

   这会校验 `vN` 的 token / class overrides 已经进入当前 source，然后用当前
   source 的干净样式覆盖 `versions/vN/`（无 token/class overrides，可发布）。
8. **再发布 release**：发布端会拒绝仍带
   `manifest.tokenOverrides` / `manifest.classOverrides` 的保存版本，错误信息会提示运行
   `node scripts/promote-version.mjs vN`。promotion 后用 `pnpm build`
   刷新 `build/current/` 和 `release/`，把同一个 `vN` finalize 成干净版本后再发布。
   发布完成的定义还包括 companion cloud UI PR 已合并，或 PR/brief 明确记录本次无
   `packages/ui` 改动。

`promote-version.mjs` 只生成 handoff brief，不自动改 `.md`，也不自动改
`cloud-next-scaffold/packages/ui`。这是刻意的边界：editor 负责记录“发生了什么”，
Agent 负责起草 foundation source/contract/example patch，并把同一设计事实翻译成
`@cloud/ui` 的 TSX/Tailwind/cva 实现；人 review 最终 diff。

如果 Agent promote 改坏了根目录 source，不要从 `versions/` 反拷文件：
`versions/` 是轻量样式快照，不是完整源码备份。改用版本 manifest 记录的 Git
source commit 恢复受管 source：

```bash
node scripts/restore-version-source.mjs vN --build
# 等价:
pnpm restore:source -- vN --build
```

这个命令只恢复 `tokens/`、`primitives/`、`composites/`、`patterns/`、
`governance/` 的文件内容；它不会移动 HEAD，也不会覆盖 scripts/package/docs
这类 workflow 文件。发布端在下拉框选择版本并 release 时也会执行同一类 Git
source restore，然后再写 `release/`。

---

## 4. 添加 token

token **值**是唯一真相，只存在于 `tokens/*.css`。八个 layer 文件由 `tokens/index.css` `@import`，
`emit/build.mjs` 的 `LAYERS` 数组按 `palette · surface · typography · elevation · motion · layout · chart · dark`
顺序级联（顺序只为可读性，`@theme` 声明合并不分先后）。

**清单**：

1. **先 reuse**（见 §1）：确认现有语义 token 与 ramp 步都覆盖不了。
2. **选对 layer 文件**，加到对应 `@theme { … }` 块里：

   | 加什么 | 写进 |
   |--------|------|
   | 颜色 ramp / 语义颜色快捷方式 | `tokens/palette.css` |
   | 表面/内容/线条/品牌单色/头像/选中态 | `tokens/surface.css` |
   | 字体族 / 字号阶梯 | `tokens/typography.css` |
   | 圆角 / 阴影阶梯 | `tokens/elevation.css` |
   | 时长 / 缓动 | `tokens/motion.css` |
   | 控件尺寸 / inline padding / 容器宽度 / 断点 / 间距阶梯 | `tokens/layout.css` |
   | 图表调色板 | `tokens/chart.css` —— **必须留在 `@theme static`**（仅运行时引用，纯 `@theme` 会被 tree-shake 掉，见文件内注释） |

3. **语义快捷方式指向 ramp 步**：语义 token 用 `var()` 指向色阶，不要复制具体值。例如
   `palette.css` 里 `--color-success: var(--color-success-500);`、`--color-success-bg: var(--color-success-50);`。
   这样语义名能挺过 re-theme（法则 #3）。
4. **暗色变化则加 override 到 `tokens/dark.css`**：只覆盖暗色下**真正变化**的值，写在
   `[data-theme="dark"], .dark { … }` 块里（特异性 (0,1,0) 赢过 `:root`）。用 `var()` /
   `color-mix` 在 light 文件里定义的 token（avatar、state-selected、chart 结构色等）会自动跟随，
   **不要在 dark.css 里重复它们**。
5. **`pnpm build`** 重新生成 `release/`。**绝不手编 `release/`**。
6. **OKLCH / 命名 / 去重复审**：颜色值用 OKLCH；名字遵守该 group 的前缀约定
   （`--color-*` / `--space-*` / `--text-*` / `--radius-*` / `--shadow-*` / `--duration-*` / `--ease-*` …）；
   暗色 override 该有就有；不与现有 token 重复。
7. **PR + tag**：加 token 是 **minor**。（注意：`@theme inline` 的 shadcn 别名、`@utility z-*`、
   `@custom-variant dark`、`@layer base` 是 Tailwind **机制**不是 token 值，留在 `@cloud/ui`，**不进** foundation。）

**校验**：`pnpm build` 输出形如 `light 175 / dark 100 tokens`，确认新 token 进了 map；
随后 `node scripts/check-release.mjs` 必须干净。

---

## 5. 添加 primitive

primitive 是 L2 原子组件。一个组件是**契约优先**（`.md` 是两个消费者都遵守的法律）、**参考 CSS
其次**、**HTML 示例第三**。catalog 的 per-component class 列表**从 CSS 派生**，所以三者天然同步。

**清单**：

1. **写契约 `primitives/<name>.md>`**。结构对齐现有契约（如 [`primitives/button.md`](../../primitives/button.md)）：
   H1 标题 + 首句摘要（catalog 会抓首句作 summary）、**Contract scope**、**Variants**（变体表：
   变体名 / 用途 / token 配方）、**Sizes**、**States**（hover / active / focus-visible / disabled /
   loading / invalid …）、**Anatomy**、**Accessibility**、**Implementations**。`Implementations`
   下两节：`Next / @cloud/ui`（React prop API）与 **Artifact**（自包含 HTML 的 class 配方 —— 根
   元素、合法 class、变体/状态 class 如何组合）。契约要完整，不能是 stub。
2. **加参考 CSS 到 `primitives/primitives.css`**，开一段新 section：

   ```css
   /* ═══════════════════════════════ Toggle ═══════════════════════════════ */
   /* @component toggle */
   .toggle { … }
   .toggle__thumb { … }
   .toggle--on { … }
   ```

   - section header（`═══ Name ═══`）下**紧跟一行** marker `/* @component <slug> */`，
     `slug` **必须等于 `.md` 文件名**（即便可见 header 文本不同，例如 header 写 "Radio"
     而契约是 `radio-group`，marker 仍是 `/* @component radio-group */`）。
   - **该组件拥有的每个 class 都写在这一段内** —— base、`__elements`、`--modifiers`、以及任何
     无命名前缀的卫星 class。marker 让 build 把**整段**归给该组件，连前缀抓不到的卫星也能正确列出。
   - 全部值用 `var(--token-*)`，**零硬编码 hex/px**（1px hairline / `border-0` 等约定例外，法则 #1）。
   - **一段服务多个相近契约**：用一个 marker 写多个 slug，如 primitives.css 里日期选择器那段
     `/* @component date-picker date-range-picker date-time-picker */`，
     一次把整段 class 标给三个契约。
   - **纯工具 section 不加 marker**（如 `Baseline`、`.sr-only` 这类行为助手）—— 它们的 class 在
     闭合集里、但不属于任何 catalog 组件，这是有意为之。
3. **可选：HTML 示例 `primitives/<name>.html`** —— 可执行参考，被 `check:examples` lint，必须留在
   闭合集内（页面局部 `<style>` 的组合布局允许，新设计词汇不允许）。
4. **`pnpm build`** 重新生成 `release/catalog.*`：class 白名单（从两份 CSS）与 per-component 列表
   （从 marker）**自动派生**。**绝不手编 `release/`**。build 末行会打印 primitive 计数，确认你的组件进了目录。
5. **守卫**：`node scripts/check-release.mjs`（release 与源一致）；若加了 `.html`，
   `node scripts/check-examples.mjs --strict`（示例在闭合集内）。
6. **PR + review + tag（minor）**。review 关注：命名合约、marker 在场且匹配 `.md` slug、契约完整、
   示例过 `--strict`。

---

## 6. 添加 composite

composite 是 L2.5 页面构建块，流程与 primitive **完全相同**，只是写进 `composites/composites.css`
（它在 primitives **之后**加载，所以**可以复用** `.btn` / `.input` 等 primitive class），并多一步：
**若有 pattern 用它，必须同步 pattern 契约与 router**。

**清单**：

1. **写契约 `composites/<name>.md`**。对齐 [`composites/data-table.md`](../../composites/data-table.md)：
   H1 + 首句摘要、**Contract scope**、**Anatomy**（ASCII 解剖图）、**Density**（如有密度预设）、
   **Rules**（承重设计决策）、**Column recipes**（如有）、**States**、**Accessibility**、
   **Implementations**（`Next / @cloud/ui` + **Artifact**，Artifact 段直接给根元素层级 + 合法 class
   + 变体/状态 class，例如 data-table 的 `.table-frame › .table-scroll › table.data-table` 加
   `--compact` / `--sticky-head` 与 `.cell-num` 等单元格 class）。
2. **加参考 CSS 到 `composites/composites.css`**，规则与 §5 第 2 步一致：`═══ Name ═══` header +
   紧跟的 `/* @component <slug> */` marker，该 composite 的全部 class（含卫星，如 `summary-bar`
   段里的非命名 class）都在段内。复用 primitive class（`.btn` / `.input` …）无需在此重复定义。
   纯工具段（如 `Stack`、auto-fit grids）不加 marker。
3. **可选：HTML 示例 `composites/<name>.html`**。
4. **若某 pattern 使用此 composite** —— 两处都要补，否则 `check:patterns` 失败：
   - 在该 pattern 契约 `patterns/<pattern>.md` 的 **Building blocks** 表里加一行（链接到
     `../composites/<name>.md`）；
   - 在 `patterns/router.json` 对应 route 的 `composites[]` 数组里加上 `<name>`。

   `check-pattern-router.mjs` 断言：`route.composites` 每个名字（a）是真实 catalog composite，
   （b）在该 pattern 契约文本里被提及（`composites/<name>.md` 链接或裸词匹配均可）。**契约是真相来源。**
5. **`pnpm build`**（class 自动派生）。**绝不手编 `release/`**。
6. **守卫**：`check:release` · `check:examples --strict`（若加了 `.html`）· `check:patterns`（若动了 router/pattern 契约）。
7. **PR + tag（minor）**。

---

## 7. 添加 pattern

pattern 是 L3 整页原型 —— 一个命名的**结构 + 顺序**框架，由 composite 组装（法则 #5 / #9）。它有三件
配套物：契约 `.md`、HTML 示例 `.html`、`router.json` 里的一条 route。

**清单**：

1. **写契约 `patterns/<name>.md`**。对齐 [`patterns/list-page.md`](../../patterns/list-page.md)：
   H1 + 使用场景、**Copyable examples**（链到 `.html`）、**Anatomy**（从上到下的 ASCII 图，`■`
   标必填核心、`○` 标可选）、**Required core / optional slots**（**权威表格**：哪些插槽必填、哪些可选、
   何时包含 —— 法则 #9 要求每个 pattern 声明一个**最小必填核心**）、**Sticky model**（如有）、
   **Rules**、**Variants & optional slots**、**Building blocks**（把解剖插槽**映射到它使用的
   composite** 的表格，每行链到 `../composites/<x>.md`）。
2. **写 HTML 示例 `patterns/<name>.html`** —— 它是 `scripts/build-artifact.mjs` 的**构建模板**：
   该脚本用正则提取 `<main class="app-frame__main"> … </main>` 内的页面内容再重新包壳，所以示例
   **必须包含一个 `.app-frame__main`**（`build-artifact.mjs` 找不到它会直接报错退出）。在示例里用
   HTML 注释标注 `REQUIRED CORE` 与 `OPTIONAL` 插槽（见 `list-page.html` 的写法）。示例只能用闭合集
   内的 class（`check:examples --strict` 会查）。
3. **在 `patterns/router.json` 加一条 route**，**字段必须齐全**（`check-pattern-router.mjs` 逐字段断言）：

   | 字段 | 要求 |
   |------|------|
   | `pattern` | 必须等于 catalog pattern 名（= `.md` 文件名）|
   | `builderPattern` | `build-artifact.mjs --pattern` 用的模板名；对应的 `patterns/<builderPattern>.html` 必须存在 |
   | `contract` | 必须**精确等于** catalog 记录的契约路径（`patterns/<name>.md`）|
   | `example` | `patterns/<name>.html`（存在性被查）|
   | `intent` | 非空字符串 |
   | `chooseWhen` · `avoidWhen` · `keywords` · `exampleRequests` · `outputNameHints` · `composites` · `clarifyIf` | 必须都是数组（中英混合关键词）|
   | `defaultTitle` | 非空字符串 |
   | `composites` | 数组里每个名字都要是真实 catalog composite，**且在本 pattern 契约里被提及**（见 §6 第 4 步）|

   然后把这条 route 的判定语句**插入 `decisionOrder` 数组**的正确优先级位置（先匹配到的优先；
   现有顺序：advanced-filter → list → detail → wizard → form → actions）。`router.json` 顶层还需
   `version: 1`、`routes` 对象、`decisionOrder` 数组、`aiFlow` 数组 —— 这些已存在，只是别破坏它们。
4. **`pnpm build`**：catalog 的 patterns 段从 `patterns/*.md` 重新生成（pattern 的 `classes` 恒为
   `[]` —— pattern 组合的是 composite，不是裸 class）。**绝不手编 `release/`**。
5. **守卫**：`node scripts/check-pattern-router.mjs`（route ↔ catalog ↔ 契约对齐）+
   `node scripts/check-examples.mjs --strict`（新 `.html` 在闭合集内）+ `check:release`。
   还要确认 `node scripts/build-artifact.mjs --pattern <name> --out /tmp/x.html` 能跑通（它会自动跑
   strict 校验）。
6. **PR + tag（minor）**。

---

## 8. 删除

删除是**破坏性**操作（消费者可能正在用它）—— 通常是 **major bump**，PR 里明确标注。关键是把所有
引用一并清掉，**让守卫替你抓漏**。

**按类型删什么**：

- **删 token**：从 `tokens/<layer>.css`（及 `tokens/dark.css` 的 override）移除该声明 → `pnpm build`。
  风险：仍引用它的 example/artifact 会出现未知 `var(--…)`。`check:examples --strict` 会在 in-repo
  example 上 FAIL；产物侧由 `check-artifact.mjs` 兜底。
- **删 primitive / composite**：① 删 CSS 里**整段 section + marker**；② 删契约 `<name>.md`；
  ③ 删示例 `<name>.html`（若有）；④ 若是被 pattern 用的 composite，删掉所有
  `patterns/*.md` Building blocks 里的引用**和** `patterns/router.json` 各 route `composites[]` 里
  的该名字 → `pnpm build`。
- **删 pattern**：删 `patterns/<name>.md` + `patterns/<name>.html`；删 `router.json` 里指向它的
  route，并从 `decisionOrder` 移除对应语句 → `pnpm build`。注意：每个 catalog pattern 都**必须**有
  route 指向它（`check-pattern-router.mjs` 会 `report("no route points to catalog pattern …")`），
  所以删 pattern 必须连 route 一起删。

**守卫如何抓悬挂引用**（删完务必跑 `pnpm check:all`）：

| 漏删情形 | 哪道守卫抓 |
|----------|------------|
| 某 example 还在用被删的 class | `check:examples --strict` → 该 class 不在闭合集 → FAIL |
| 某 route 还指向被删的 composite / pattern | `check:patterns` → `unknown composite` / `unknown catalog pattern` → FAIL |
| 删了 pattern 但忘了删它的 route 或漏删 decisionOrder/contract | `check:patterns` → contract 路径不匹配 / builderPattern 示例缺失 → FAIL |
| 忘了 `pnpm build`，release 仍含已删项 | `check:release` → release 与源不一致 → FAIL |

> 删 token / primitive / composite **不会**让某 catalog pattern 失去 route，所以那条"no route points
> to pattern"断言只对**删 pattern** 相关。

---

## 9. 修改

### 9.1 改 token 值

1. 改 `tokens/<layer>.css` 里的值（暗色也变则同步改 `tokens/dark.css`）。
2. `pnpm build` → 重生成 `release/`。
3. 这是**有版本意义的设计决策**，不是 tweak：它会**位移每一个引用该 token 的表面**，且**两个消费者
   都动**（Next 导入 `@theme` 源、artifact 内联 `release/tokens.inline.css`）。**改值若位移现有 UI → major bump**，PR 里标注。
4. 守卫：`check:release` + `check:examples --strict`（确认 example 视觉仍在闭合集内）。

### 9.2 改契约（`.md`）

**契约赢过实现**（法则 #5）。改了 `.md` 的变体/状态/插槽语义后，**两个实现都要同步**：参考 CSS
（`primitives.css` / `composites.css`）与 React `@cloud/ui`。改 pattern 契约的 Building blocks /
必填核心时，连带检查 `router.json` 的 `composites[]` 是否仍对齐（`check:patterns`）。破坏性契约改动
→ **major**。

### 9.3 重命名一个 class

把同名的所有出现**一起改**，避免任何一处掉队：

1. CSS 里改类名（`primitives.css` 或 `composites.css`）；
2. 改该 section 的 `/* @component <slug> */` marker（**仅当是改 slug/契约文件名**时；只改普通
   class 名时 marker 的 slug 不变）；
3. 改契约 `.md`（Anatomy / Rules / Implementations→Artifact 里的类名）；
4. 改该组件的 `.html` 示例；
5. 改任何用到它的**其他** example（pattern / 别的 composite 的 `.html`）。
6. `pnpm build` → 派生列表自动更新。

**守卫**：`pnpm check:all`。`check:release` 抓 release 漂移；`check:examples --strict` 抓任何还在用旧类名的
example；改了 composite 名（= `.md` 文件名）则 `check:patterns` 抓 router/契约里的旧引用。重命名属
破坏性契约改动 → **major**。

> 任何修改的收尾都一样：**`pnpm build` + 跑守卫**。改完别忘了把重生成的 `release/` 一起提交 ——
> `check:release` 就是为了抓"忘了 build / 忘了提交 release"。

---

## 10. 同步 editor substrate（foundation-maintain）

加 / 删 / 重命名任何 token · primitive · composite · pattern 都会改变 `release/catalog.json`。
可视化 editor 住在独立仓库 [`foundation-maintain`](https://github.com/Newland-Payment-Technology-US-Co-Ltd/foundation-maintain)，
它**不读 foundation 源码**，而是对着一份从本仓库导出的静态 catalog + 每版预览 CSS 做预览。所以闭合集一变，
**不重新导出，editor 就停在旧闭合集** —— 新组件它看不到、已删组件它还列着，基于旧目录做的可视化编辑会和真实
source 打架。

> 这条是 **foundation → maintain** 方向（下游 substrate 刷新），与 §3.4 的 **maintain → foundation**
> （`manifest.json` 回流：`apply-draft → promote → finalize → release`）是两个相反方向，别混。加 / 删组件是
> **纯 foundation 源码编辑**，editor 表达不了"新增/删除一个组件"，所以它永远从这条下游同步得知闭合集变化，
> 不是从 manifest 回流。

**什么时候跑**：任何改动了闭合集的 PR 落地后 —— 即 §4–§9 里加 / 删 / 改契约 / 重命名 class 的任何一种；
以及每次 `pnpm release` 让版本集变化之后。纯 token 值微调即便没改 catalog 名字集，每版预览 CSS 也变了，
仍应重导出。

**怎么跑**（在 foundation 仓库根目录）：

```bash
node scripts/export-maintain-assets.mjs ../foundation-maintain/carbon
```

它往 maintain 仓的 `carbon/` 写三样，然后**到 `foundation-maintain` 仓库把它们 commit + push**：

| 产物 | 内容 |
|------|------|
| `catalog.json` | `release/catalog.json` 的副本（新组件在此；删掉的从此消失）|
| `versions.json` | 版本索引（current + 全部 `versions/vN` + 已发布版本标记）|
| `versions/<vN>/{tokens.inline.css, primitives.css, composites.css}` | 每个版本的预览 CSS |

> 路径参数指向与 foundation **平级**的 `../foundation-maintain/carbon`（当前 checkout 布局即如此，可直接照抄）；
> 若目录布局变了就把参数改成实际位置。这与 [`governance/release-workflow.md`](../../governance/release-workflow.md)
> §3「Refresh the editor's substrate」是同一步。

**守卫**：此步没有 foundation 侧 CI 守卫（它写的是**另一个仓库**），靠维护者记得跑。判断"是否漏同步"的信号：
在 editor 里新组件缺席 / 已删组件仍出现在 catalog 面板。

---

## 11. 附录：文件地图与关键事实

### 源与生成物

```
tokens/                         # token 值（唯一真相，手写）
  index.css                     # @import 八个 layer
  palette · surface · typography · elevation · motion · layout   # @theme { }
  chart.css                     # @theme static { }（防 tree-shake）
  dark.css                      # [data-theme="dark"], .dark { } 覆盖
primitives/
  primitives.css                # 参考 CSS：═══ header + /* @component slug */
  <name>.md                     # 契约（每个 primitive 一个）
  <name>.html                   # 可选示例
composites/
  composites.css                # 参考 CSS（在 primitives 之后加载，可复用 .btn/.input）
  <name>.md / <name>.html       # 契约 + 可选示例
patterns/
  router.json                   # 意图路由：routes + decisionOrder + aiFlow
  <name>.md / <name>.html       # 契约 + 示例（.html 须含 .app-frame__main）
release/                           # ★ 全生成，永不手编：对外发布的闭集契约
  tokens.inline.css · tokens.json · catalog.json · catalog.md
build/current/                     # ★ 全生成，永不手编：当前源码预览态（HEAD 编译；被 check-release 守）
  tokens.inline.css · primitives.css · composites.css · manifest.json
emit/build.mjs                  # ★ THE build（pnpm build）
scripts/
  check-release.mjs · check-examples.mjs · check-pattern-router.mjs   # 守卫
  check-artifact.mjs            # 产物侧闭合集校验（example 守卫复用它）
  build-artifact.mjs            # 从 pattern.html 生成产物骨架
  export-maintain-assets.mjs    # 把 catalog + 每版 CSS 导出给 foundation-maintain editor（§10）
governance/
  principles.md · enforcement.md · token-change.md · composition.md
.github/workflows/checks.yml    # CI：三道守卫
```

### 当前规模（`pnpm build` 输出）

- **175** tokens（light）/ **100** dark override · **50** primitives · **25** composites ·
  **5** patterns · **667** 闭合集 class。

### 一句话记牢

> 改源 → `pnpm build` → 跑 `pnpm check:all` → 提交含重生成的 `release/` → 闭合集变了再
> `node scripts/export-maintain-assets.mjs ../foundation-maintain/carbon` 同步 editor（§10）→ 加是 minor、
> 改值/破坏是 major、契约永远赢。**永不手编 `release/`，永不在消费者侧分叉一份值。**
</content>
</invoke>
