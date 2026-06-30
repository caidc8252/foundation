# Artifact 搭建实操手册：从需求到合规 HTML

> **版本**: 基于 foundation `develop` 分支，2026-06-29
> **定位**: foundation 三职责中**职责①（按需求搭原型 artifact）**的实操手册 ——
> **一个需求进来后，如何一步步搭出符合本设计系统的 artifact HTML**。三职责总览与分流
> 在根目录的 [`AGENTS.md`](../../AGENTS.md)，本文是它「AI generation flow」的可跑通展开。

---

## 目录

1. [总览：需求 → HTML 流程图](#1-总览需求--html-流程图)
2. [前置：闭合集是什么、去哪查](#2-前置闭合集是什么去哪查)
3. [逐步详解（7 步）](#3-逐步详解7-步)
4. [端到端示例：做一个客户管理页面](#4-端到端示例做一个客户管理页面)
5. [闭合集规则与「页面局部组合」的边界](#5-闭合集规则与页面局部组合的边界)
6. [frameless shell 的 sticky 滚动根（仅手搭 shell 时相关）](#6-frameless-shell-的-sticky-滚动根仅手搭-shell-时相关)
7. [自检清单](#7-自检清单)

---

## 1. 总览：需求 → HTML 流程图

一句话：**用 `router.json` 把需求收敛到一条 route → 用 `build-artifact.mjs` 生成已内联三层 CSS 的骨架 → 以 pattern 的 `.html` 为主模板逐个配置 composite（先读 `.html` 样例再写标记）→ 取图标 → `check-artifact.mjs --strict` 收尾。**

```
用户自然语言需求
   │
   ▼  ① router.json：按 decisionOrder 匹配，选 ONE route
route { pattern, builderPattern, contract, example, composites, clarifyIf … }
   │
   ▼  ② build-artifact.mjs --pattern <builderPattern> --out artifacts/<name>.html --title "…"
自包含 HTML 骨架（已内联 font+tokens+primitives+composites，含 [hidden] 守卫，自动跑 --strict）
   │
   ▼  ③ 读 route.example = patterns/<name>.html（主模板：复制后改，不要从零拼）
   │     交叉核对 route.contract = patterns/<name>.md（required-core vs optional-slot，契约为准）
   │
   ▼  ④/⑤ 对 route.composites 里每个组件：先读 composites/<x>.html 样例，再照 composites/<x>.md 契约配置
   │
   ▼  ⑥ icon.mjs search <english-intent> → get <name> → 粘贴确切 <svg>（data-lucide 在首）
   │
   ▼  ⑦ 填真实业务内容 → check-artifact.mjs --strict <file>
合规 artifact HTML ✓
```

> 若需求落到某条 route 的 `clarifyIf` 情形（例如「管理页」既可能是表格也可能是仪表盘），
> **先向用户澄清再开工**，不要凭猜动手。

---

## 2. 前置：闭合集是什么、去哪查

artifact 渲染出的一切只能来自这 **4 层闭合集 + 图标**，没有第五来源：

| 层 | 取什么 | 位置 |
|---|--------|------|
| ① Tokens | `--*` 自定义属性（颜色/间距/字号/圆角/阴影/动效…） | `release/tokens.inline.css` |
| ② Primitives（原子类） | `.btn` `.input` `.badge` `.card` `.field` … | `primitives/primitives.css` |
| ③ Composites（构建块类） | `.page-header` `.data-table` `.summary-bar` … | `composites/composites.css` |
| ④ Patterns（页面原型） | list / detail / create-form / create-wizard / actions | `patterns/*.md` + `.html` |
| ＋ Icons（原料，非类层） | 内联 Lucide `<svg>`（带 `data-lucide`） | `scripts/icon/icon.mjs` |

**去哪查合法名字**：

- 人读 → [`release/catalog.md`](../../release/catalog.md)：每个 token 前缀分组、每个 primitive/composite 一行（用途 + 类名 + 契约/样例链接）。**先看它**。
- 机器读 / 校验依据 → [`release/catalog.json`](../../release/catalog.json)：`tokens` / `primitives` / `composites` / `patterns` + 扁平的 `classes` 集合（`check-artifact.mjs` 即以此为准）。

> 在 catalog 里找不到的 token / class / pattern = **不属于本系统**。`release/` 完全由 `pnpm build`
> （= `node emit/build.mjs`）从 `tokens/`、各 `.md`、两份 `.css` 生成，**永不手编**；
> 要改值就改 `tokens/` 再 `pnpm build`。

---

## 3. 逐步详解（7 步）

每步给「输入 / 命令 / 产出 / 注意」。这就是 `AGENTS.md` 的「AI generation flow」落到命令上的形态。

### 步骤 1 · 用 `router.json` 选一条 route

- **输入**: 用户需求 + [`patterns/router.json`](../../patterns/router.json)。
- **动作**: 按顶层 `decisionOrder` 自上而下匹配，**选且仅选一条** route；用每条 route 的
  `keywords` / `exampleRequests` / `chooseWhen` / `avoidWhen` 判断，命中 `clarifyIf` 先澄清。
- **产出**: 一个 route 对象。你后面要用到它的这些字段：

  | 字段 | 用途 |
  |------|------|
  | `builderPattern` | 步骤 2 的 `--pattern` 取值（注意：可能 ≠ `pattern`，如 `list-page-advanced-filter`） |
  | `contract` | pattern 契约 `.md`，步骤 3 交叉核对 required/optional |
  | `example` | pattern HTML 样例，步骤 3 的**主模板** |
  | `composites` | 该模式用到的 composite 名单 —— 步骤 4/5 要逐个打开其 `.md` + `.html`（schema.json 删除后这是组件清单的权威来源） |
  | `defaultTitle` / `outputNameHints` | 默认标题 / 建议文件名 |

- **决策顺序**（`decisionOrder`，先匹配先得）：明确高级筛选 → `list-page-advanced-filter`；多记录/管理表格/浏览/筛选 → `list-page`；单条记录详情/概览 → `detail-page`；多步入驻/复核 → `create-wizard`；注册/登录/创建/编辑/简单表单 → `create-form`；只演示页面动作 → `actions`。
- **注意**: 只选一条。歧义先问。

### 步骤 2 · 用 `build-artifact.mjs` 生成骨架

- **输入**: `route.builderPattern`。
- **命令**:
  ```bash
  node scripts/build-artifact.mjs --list   # 列出 6 个可用 builder pattern
  node scripts/build-artifact.mjs --pattern list-page --out artifacts/customers.html --title "Customers"
  ```
  | 参数 | 含义 |
  |------|------|
  | `--pattern <name>` | 用 `route.builderPattern`（`--list` 输出：actions / create-form / create-wizard / detail-page / list-page / list-page-advanced-filter） |
  | `--out <file>` | 输出路径（约定写到 `artifacts/`） |
  | `--title <text>` | 写入 `<title>`（缺省取样例 `<title>` 或 `Artifact - <pattern>`） |
  | `--no-check` | 跳过自动 strict 校验（默认会跑） |
- **`build-artifact.mjs` 实际做了什么**（已读源码核对）：
  1. 读 `patterns/<builderPattern>.html`，**抽出 `<main class="app-frame__main">` 内的页面内容**；
  2. 把它重新包进 **frameless 形态**：`.app-frame.app-frame--frameless > main.app-frame__main`
     —— app-frame 收成单列、**去掉 sidebar / header 这层 chrome，连 `.app-frame__col` 一并省去**
     （"frameless" 即指此 —— 一个无侧栏无顶栏、内容铺满视口的独立功能页）。
     `app-frame__main` 类与角色**不变**：`.app-frame--frameless` 上的 `height:100vh + overflow:hidden`
     仍把它兜成真正的滚动根（`overflow-y:auto`），所以页面滚动与 sticky 行为和生产一致；
  3. 按顺序内联 5 段 CSS 进一个 `<style>`：① 内嵌 Geist 字体层 → ② `release/tokens.inline.css` → ③ `primitives/primitives.css` → ④ `composites/composites.css` → ⑤ 页面样板（`html`/`body` 背景 + `[hidden]{display:none!important}` 守卫 + 样例自带的页面局部 `<style>`）。**primitives 必须在 composites 之前**（composites 复用 `.btn`/`.input`）；
  4. 顶部盖 `<!-- foundation: vX -->` 版本戳；
  5. 除非 `--no-check`，**自动跑 `check-artifact.mjs --strict`** 对产物兜底。
- **产出**: 一个能直接打开、且已通过 strict 的自包含 HTML（此时还只是 pattern 的占位内容）。
- **注意**: 永远从这一步起步，不要手搓 `<head>`/三层 CSS；改完后再次手动跑 strict。

### 步骤 3 · 读 pattern 的 `.html` 样例（主模板）

- **输入**: `route.example`（如 `patterns/list-page.html`）；交叉参考 `route.contract`（如 `patterns/list-page.md`）。
- **动作**: 把 `.html` 当**可执行规格**读 —— 它给出确切 DOM、class 组合、aria、以及 empty/loading/error 状态交换块。**复制它再改**，不要从零拼装。再回 `.md` 核对 **required core vs optional slot**：契约为准，`.html` 示范怎么渲染。
- **产出**: 对该模式完整骨架与可删/必留部分的判断。
- **注意**: list-page 的 required core 只有 **page-header** 和 **results card（summary/count 条 · 表格 · 分页）**；筛选条、banner、分段 tab、KPI、选择列等都是 optional —— **用不到就整段删掉**，删干净仍是一个完整正确的列表页。

### 步骤 4 · 逐个读 composite 契约（`.md`）

- **输入**: `route.composites` 列表 → 对每个名字打开 `composites/<x>.md`。
- **动作**: 从契约读：首句摘要（用途）、**Anatomy**（必备/可选结构）、**Density**（密度预设）、**Rules**（承重决策）、**States**（各状态）、**Implementations → Artifact**（自包含 HTML 的根元素层级 + 合法 class + 变体/状态 class 配方）。
  - 例：`composites/data-table.md` 的 Artifact 段直接给出
    `.table-frame › .table-scroll › table.data-table`，可用变体 `--compact`/`--spacious`/`--sticky-head`/`--sticky-col`/`--striped`，单元格类 `.cell-num`/`.cell-2line`/`.cell-tags`/`.cell-chevron`/`.cell-empty`/`.cell-right`、`.row-actions`、`.col-select`。
- **产出**: 每个 composite 的配置方案。
- **注意**: 合法 class 的机器可读兜底是 `release/catalog.json` 里该 composite 的 `classes`。**已无 `composites/schema.json`**（已删除）—— 不要去找它，也没有任何 schema.json 步骤；配置就靠 `route.composites` → 各组件 `.md` 契约 + `.html` 样例。

### 步骤 5 · 配置 composite，照 `.html` 样例的确切标记

- **输入**: 每个 composite 的 `composites/<x>.html`。
- **动作**: **写任何标记前，先读对应 `.html` 样例**（反幻觉保障）——它演示每个变体/状态在上下文里的确切 DOM。样例顶部的 **「When to use」决策指南**帮你在相近组件间选对，例如：
  - `data-table.html`：「需要列 / 排序 / 行选择的结构化记录才用 data-table；非表格的设置/成员/导航行用 `list-row`，事件/活动流用 `feed-list`，键值属性用 `kv-grid`」。
  - `list-filter.html`：「search + 快捷筛选下拉 + 可见 chips 用 condition-band；筛选维度多 → 走 `list-page-advanced-filter`；只要单字段搜索 → 一个裸 `.search-input` 足矣；详情/创建页不要用 condition-band」。
  - `pagination.html`：「表格永远用 SIMPLE 变体（‹ Prev · 当前页 · Next ›），编号分页只给搜索结果/独立分页器」。
- **产出**: 每个 composite 用契约的 required/optional 槽 + 样例的确切标记拼好。
- **注意**: 用契约给的合法 class，别发明结构或类名；样例之间不要混抄（每段是自洽的独立 pattern）。

### 步骤 6 · 取图标

- **输入**: 要表达的语义意图（用英文）。
- **命令**:
  ```bash
  node scripts/icon/icon.mjs search "add"   # 按英文标签搜名字
  node scripts/icon/icon.mjs get plus       # 拿确切 <svg>
  node scripts/icon/icon.mjs list <substr>  # 列出名字含子串的图标
  ```
  `get` 返回形如：`<svg data-lucide="plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" …>…</svg>`。
- **动作**: 粘贴**确切** `<svg>`，保持 `data-lucide="<name>"` 为首属性、`stroke="currentColor"`。
- **产出**: 内联 SVG。
- **注意**: **永不手写路径或发明名字**；换 3 个不同英文词仍搜不到，就把缺口报告给人。版本锁在
  `scripts/icon/data/VERSION`（当前 `lucide-static@1.21.0`，1737 个图标）；`refresh`/升级版本只能由人类维护者做。

### 步骤 7 · 填内容并校验

- **输入**: 生成的 artifact + 真实业务内容。
- **动作**: 替换占位文案、按业务增删 optional 槽（保留 required core）、需要时在产物自己的 `<style>`
  里加**仅由 token 构成**的页面局部布局类（见 §5）。
- **命令**:
  ```bash
  node scripts/check-artifact.mjs --strict artifacts/customers.html
  ```
- **校验项**（已读 `check-artifact.mjs` 源码核对）：

  | 检查项 | 默认模式 | `--strict` |
  |--------|----------|------------|
  | 硬编码颜色字面量（`#hex` / `rgb()` `rgba()` / `hsl()` `hsla()` / `oklch()` `oklab()`） | FAIL | FAIL |
  | 未知 `var(--…)`（不在 catalog tokens，且非页面自定义属性） | FAIL | FAIL |
  | 闭合集外 class（既非 foundation 类，也未在本文件 `<style>` 定义） | WARN | **FAIL** |
  | 未知 Lucide 图标名（`data-lucide` 不在注册表） | FAIL | FAIL |
  | 被篡改的图标路径（SVG body 与注册表不符） | WARN | **FAIL** |
  | 无 `data-lucide` 的图标形 `<svg>` | WARN | WARN |
  | 内联 `style="padding…/margin…"` 布局 hack | WARN（仅咨询，永不影响退出码） | WARN |

  > 校验器会先剥掉三层已知 foundation CSS 体，只扫你写的标记 + 页面局部 CSS；
  > **页面局部 class** 和**页面自己定义的 CSS 自定义属性**都是允许的。
- **产出**: `→ PASS` / `✓ all clean`（退出码 0）即合规。
- **注意**: `color-mix(in oklch, var(--token) …)` 这类包了 `var()` 的不算硬编码；
  纯文本里的 `#10482`（订单号）也不算（只扫 CSS 与属性上下文）。

---

## 4. 端到端示例：做一个客户管理页面

需求：**「做一个客户管理页面」**（`exampleRequests` 里就有这句）。

**① 选 route。** `decisionOrder` 第 2 条命中「多记录 / 管理表格 / 浏览 / 筛选」→ route `list-page`。
（若用户说「带高级筛选」则按第 1 条走 `list-page-advanced-filter`。）拿到：

```
builderPattern = "list-page"
contract       = "patterns/list-page.md"
example        = "patterns/list-page.html"
composites     = ["page-header","page-body","list-filter","summary-bar",
                  "data-table","pagination","empty-state","skeleton"]
```

**② 生成骨架。**

```bash
node scripts/build-artifact.mjs --pattern list-page --out artifacts/customers.html --title "Customers"
```

输出会显示 `wrote artifacts/customers.html …` 并自动跑出
`→ PASS (strict: …)` / `✓ all clean`。

**③ 读主模板。** 打开 `patterns/list-page.html`（复制后改），对照 `patterns/list-page.md`：
required core = `page-header` + results card；本例需要筛选与分页，保留 condition band、summary bar、表格、分页；
若这个列表不支持批量操作，就**删掉 `col-select` 选择列**；不需要 banner/分段 tab/KPI 就整段删。

**④/⑤ 逐个配置 composite**（每个先读 `.html` 再照 `.md`）：

| composite | 怎么配（契约 Artifact 段 + 样例标记） |
|-----------|--------------------------------------|
| `page-header` | 标题 "Customers" + 可选 `page-header__count`（如 "1,248"，与 summary 条计数同步）+ 至多一个 primary 动作（"New customer"） |
| `page-body` | gutters + stack 容器，子元素默认全宽，不加 `max-width` 包裹 |
| `list-filter` | `.condition-band` › `.condition-band__toolbar`：`.search-input`（图标用 `.search-input__icon` 包，别裸塞 `<svg>`）+ 快捷筛选 `<select>` + Search 按钮；已应用项用 `.applied-filters` + `.filter-chip`。提交在 Search 按钮，不在 change |
| `summary-bar` | `.summary-bar--sticky`：`.summary-bar__count`（"N customers"，有筛选时追加 "matching filters"）+ 可选 `.summary-bar__actions`（Export，secondary） |
| `data-table` | `.table-frame.table-frame--flush` › `.table-scroll` › `table.data-table.data-table--sticky-head`；两行名字用 `.cell-2line`、注册日期/ID 用 `.cell-num`、状态用 tonal `badge`、类别/标签用 `neutral` badge（`.cell-tags`）、行尾导航箭头 `.cell-chevron`；空值渲染 `—`（`.cell-empty`）。整行点击导航到详情，行内不放 edit/delete |
| `pagination` | SIMPLE 变体（`RichPagination`）：rows-per-page + "Showing X–Y of Z" + ‹ Prev · 当前页 · Next ›，无编号跳页 |
| `empty-state` | 替代行渲染：nothing-yet 引导主动作；no-results-for-filters 给「clear filters」 |
| `skeleton` | loading 时填满表框 |

> sticky 细节：summary 条 sticky，sticky-head 的 `th` 顶偏移 = summary 条高度（`--space-12`，48px），
> 两者在同一滚动根内贴合 —— 这正是 `data-table.md` 与 `list-page.md` 的承重决策。

**⑥ 取图标。** 例：主动作 "New customer" 的加号

```bash
node scripts/icon/icon.mjs search "add"     # → plus / circle-plus / user-plus …
node scripts/icon/icon.mjs get user-plus
```

把返回的确切 `<svg>` 粘进按钮（`data-lucide` 在首）。搜索框放大镜、行尾箭头、Export 等同理。

**⑦ 填真实客户数据并校验。**

```bash
node scripts/check-artifact.mjs --strict artifacts/customers.html
```

看到 `✓ all clean` 即合规交付。

---

## 5. 闭合集规则与「页面局部组合」的边界

**核心规则**：凡是 token / primitive 类 / composite 类能覆盖的，就用它们 ——
**有 token 处不准硬编码 hex/px，有现成类处不准手搓组件**。

**唯一允许的本地增量 = 页面局部组合（page-level composition）**：在 artifact 自己的
`<style>` 里加几个 helper class，用来排布**单元格内容 / 布局**（如两行表格单元、
图标+文字对齐），**只能由 token 构成**。这是布局胶水，不是新设计词汇。
校验器把这些「定义在本文件 `<style>` 里的类」和「本文件定义的 `--自定义属性`」都视作合法。

| 能在 `<style>` 里加 ✅ | 不能加 ❌ |
|----------------------|-----------|
| 用 `var(--space-*)` 拼的 flex/grid 布局类 | 新颜色 `#…` / `rgb()`（→ 必是 token） |
| 两行单元 `.cell-2line` 式的内容排布（值全来自 token） | 闭合集外的新组件 / 第三方组件库类 |
| 页面局部状态变量（`--toast-duration: …` 之类，自己定义自己用） | 新字号/圆角/阴影字面量（→ 用 `--text-*`/`--radius-*`/`--shadow-*`） |
| `[data-theme="dark"]` 主题切换（仅切换，不改色值） | 改 token 的值（值只在 `tokens/` 里改，再 `pnpm build`） |

**遇到真缺口**（闭合集表达不了的东西）：那是**契约缺口，不是即兴的许可** ——
走 [`governance/token-change.md`](../../governance/token-change.md)（token）或提 primitive/composite 契约 PR，
**别在 artifact 侧 fork 一个值**（那正是本 foundation 要消除的漂移）。

---

## 6. frameless shell 的 sticky 滚动根（仅手搭 shell 时相关）

`build-artifact.mjs` 把页面重包进 frameless 形态（去掉 header/sidebar chrome，并省去 `.app-frame__col`）：
`.app-frame.app-frame--frameless > main.app-frame__main`，`main` 即真正的滚动根。
`--frameless` 让 `.app-frame` 自己当那一列（`flex-direction:column`），`app-frame__main` 不变；
要带门户 chrome（侧栏+顶栏）才用完整 `.app-frame`（见 `composites/app-frame.md` 的 Frameless form）。
而 `[hidden]{display:none!important}` 已下沉到 `primitives.css` 基线，**任何内联三层 CSS 的产物都自带**
（不再是 builder 注入的页面局部 reset），所以「`[hidden]` 盖不住 `.card{display:flex}`」这一类问题已从源头消除，无需关心。

唯一仍需理解的一点，且**只在你自己改写 shell、剥掉 app-frame 包裹、或叠自己的滚动容器时**才相关：

- **Sticky 需要一个滚动根。** `--sticky-head` / `summary-bar--sticky` / `page-header--sticky`
  贴的是最近的滚动祖先；若没有 `app-frame__main` 这样的 `overflow-y:auto` 根（`.table-scroll` 只横向滚），
  原本「让头部贴在 sticky 条下方」的 `top:` 偏移会留出空带或盖住首行。这是 sticky 的固有性质 ——
  滚动祖先由你改 shell 时控制，代码无法静态替你保证，所以只能靠默认结构兜住。
  修法：保持 sticky `top: 0`（或去掉 `--sticky*` 修饰），或自己包一个 `overflow-y:auto` 滚动根。

修法属页面局部组合（一个包裹），仍在闭合集内。**暗模式只用 `[data-theme="dark"]` 切换 —— 永不改色值。**

---

## 7. 自检清单

对照 [`governance/enforcement.md`](../../governance/enforcement.md) 的 artifact checklist（可跑的部分由 `--strict` 兜底）：

- [ ] `node scripts/check-artifact.mjs --strict <file>` 干净（无闭合集外 token/颜色/class；页面局部类都在本文件 `<style>` 里有定义）。
- [ ] 内联的是**当前** `release/tokens.inline.css`（非过期快照）；`release/` 没被手编。
- [ ] 每个颜色/尺寸/圆角/阴影都是 `var(--token-…)` —— token 能覆盖处零 hex/px 字面量。
- [ ] primitives/composites 用 `primitives.css` / `composites.css` 的类（`.btn` `.input` `.data-table` …），与契约一致，不是手搓一次性组件。
- [ ] 任何 token 表达不了的视觉都走 `token-change.md` 提案，没有硬编码。
- [ ] 暗模式靠切 `[data-theme="dark"]` 工作，没有改颜色值。
- [ ] 页面有真正的滚动根（builder 默认给的 `app-frame__main`），sticky 行为正确（见 §6）；`[hidden]` 由 `primitives.css` 基线统一处理，无需额外注入。
- [ ] required core 齐全、optional 槽按业务取舍；图标全部由 `icon.mjs` 取得、`data-lucide` 在首。

> 校验是「合法性」闸门；交付质量还要过 [`governance/composition.md`](../../governance/composition.md) 的「完成感」一眼，
> 设计法律见 [`governance/principles.md`](../../governance/principles.md)（13 条）。
