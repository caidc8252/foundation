# 规则：foundation 组件登记表（可手调 · 驱动 3 档壳 + 3 档速查）

> 本表是"哪个组件进哪一档"的**唯一手调源**。生成命令**只读本表**产出 3 份速查 + 驱动 3 档壳;`foundation-set.md` 引用本表。
> **三档速查（预生成、都提交）对应入口"模板使用度"**：`低=30%` · `中=70%` · `高=100%(全量)`。
> **档累积**：`30 ⊂ 70 ⊂ 100`。每个组件标它**首次进入的档**:`30`(三份都含)/ `70`(中+高含)/ `100`(仅全量含)。**手调 = 改这一列标记**(降档=更常用,升档=更边缘)。
> 表内清单由 foundation `release/catalog.json` 实时扫描核对(见"漂移检测")。foundation 版本 = `release/manifest.json` 的 `version` + `sourceCommit`。

---

## 一、来源映射（各材料从哪取）

| 用途 | 取自 | 说明 |
|---|---|---|
| **tokens（CSS）** | `release/tokens.inline.css` | 壳内联;全量 tokens 恒内联,不按本表筛 |
| **组件名字 / vocab / 用途** | `release/catalog.json`（+ `catalog.md` 人读） | 命令实时抄 class 名、token 名——**自动跟 foundation 走** |
| **组件 CSS** | **源目录** `primitives/primitives.css` · `composites/composites.css` | 壳按本表选中项**切片**内联（build-netshell）。**必须读源目录**——它带 `/* @component x */` 标记可切;`release/*.css` 是逐字内联版、无标记、不可切,故不用 |
| **组件 markup 骨架** | **源目录** `primitives/<x>.html` · `composites/<x>.html` 范例 | **release/ 里没有范例** → 骨架必须从源目录蒸馏、存"骨架库"（授权一次） |
| **漂移锚点** | `release/manifest.json`（`version` / `sourceCommit`） | foundation 升级即变 → 触发漂移检测 |

> **关键**：`release/` 给 **tokens + 名字**;**组件 CSS 走源目录**(带 `@component` 标记可切,release 版不可切);**范例 markup(骨架原料)也在源目录、release/ 没有**。所以"名字全自动(release)、CSS 切片(源目录)、骨架做一次存起来(源目录范例蒸馏)"。

---

## 二、Tokens（12 组 · 恒全量内联,不筛）

命令不筛 token（`tokens.inline.css` 整份内联）。下表仅供速查"语义 token 段"取用高频组：

| 组 | 数量 | 速查是否列 |
|---|---|---|
| color | 114 | ✅ 只列语义子集（content/surface/line/primary/status/state） |
| space | 12 | ✅ |
| text | 9 | ✅ |
| radius | 6 | ✅ |
| shadow | 9 | ✅（card/overlay 档） |
| font | 4 | ✅（sans/mono） |
| breakpoint | 6 | — |
| duration / ease | 4 / 2 | —（动效属留白） |
| container | 1 | — |
| spacing | 8 | —（控件内距,组件 CSS 自带） |
| z | 7 | —（层级,组件 CSS 自带） |

---

## 三、Primitives（47）

| 组件 | 集 | 备注 |
|---|---|---|
| button | 30 | 动作 |
| input | 30 | 表单 |
| textarea | 30 | 表单 |
| select | 30 | 表单 |
| checkbox | 30 | 表单 |
| field | 30 | 表单行包裹 |
| badge | 30 | 状态/类目标签 |
| card | 30 | 容器 |
| alert | 30 | 行内状态提示 |
| modal | 30 | 居中对话框 |
| toast | 30 | 瞬时通知 |
| avatar | 30 | 身份标识 |
| progress | 30 | 完成度条 |
| separator | 30 | 分隔线 |
| label | 70 | 表单标签（现随 field 隐含,补齐显式） |
| radio-group | 70 | 单选组 |
| switch | 70 | 开关 |
| toggle | 70 | 切换钮 |
| toggle-group | 70 | 分段切换 |
| slider | 70 | 滑块 |
| input-otp | 70 | 验证码/一次性码（授权类界面高频） |
| combobox | 70 | 可搜索单/多选 |
| command | 70 | 命令面板/搜索 |
| tabs | 70 | 选项卡（壳 core 已含 CSS） |
| tooltip | 70 | 悬浮提示（壳 core 已含 CSS） |
| popover | 70 | 浮层 |
| dropdown-menu | 70 | 下拉菜单（行内操作菜单） |
| context-menu | 70 | 右键菜单 |
| accordion | 70 | 折叠面板组 |
| collapsible | 70 | 单项折叠 |
| alert-dialog | 70 | 强确认（壳 core 已含 CSS） |
| sheet | 70 | 侧滑抽屉 |
| spinner | 70 | 加载态（壳 core 已含 CSS） |
| dropzone | 70 | 文件拖拽上传 |
| date-picker | 70 | 日期选择 |
| date-range-picker | 70 | 日期区间 |
| calendar | 70 | 月历基件 |
| aspect-ratio | 100 | 布局比例盒（niche,仅全量档） |
| carousel | 100 | 轮播（niche） |
| resizable | 100 | 可拖拽分栏（niche） |
| scroll-area | 100 | 自定义滚动条（niche） |
| hover-card | 100 | 悬浮卡（niche,用 tooltip/popover 替） |
| input-group | 70 | 输入+前后缀组合（foundation 已补 `@component input-group` 标记,可独立切片；command/stepper 依赖它） |
| object-tile | 100 | 对象磁贴（niche） |
| date-time-picker | 100 | 日期时间（date-picker 覆盖多数） |
| time-picker | 100 | 时间（niche） |
| icon | 特殊 | 经 `icon.mjs get` 取 SVG,**不作速查条目**,任何档都不列 |

---

## 四、Composites（25）

| 组件 | 集 | 备注 |
|---|---|---|
| page-header | 30 | 列表页头 |
| detail-header | 30 | 详情页头 |
| list-filter | 30 | 搜索/筛选条 |
| summary-bar | 30 | 表格上方汇总条 |
| data-table | 30 | 列表表格 |
| rich-pagination | 30 | 带每页行数的分页 |
| kv-grid | 30 | 字段→值网格 |
| empty-state | 30 | 空态 |
| skeleton | 30 | 加载占位 |
| action-footer | 70 | 详情/表单底部动作条 |
| list-row | 70 | 列表项（非表格式） |
| load-more | 70 | 加载更多（分页替代） |
| stat-card | 70 | KPI 数值卡 |
| status-card | 70 | 状态面板卡 |
| step-indicator | 70 | 步骤指示（授权/流程,曾手搓致 bug） |
| stepper | 70 | 向导步进（同上） |
| timeline | 70 | 活动/历史时间线 |
| option-card | 70 | 可选卡片组 |
| toggles | 70 | 分段控件 |
| pagination | 100 | 裸分页（已用 rich-pagination,仅全量档） |
| diff | 100 | 差异对比（niche） |
| feed-list | 100 | 信息流（niche） |
| log-console | 100 | 日志控制台（niche） |
| product-card | 100 | 商品卡（niche） |
| theme-toggle | 100 | 明暗切换（原型默认 light,niche） |

---

## 五、当前计数

- **低档 30% 集**：primitives 14 + composites 9 = **23**。
- **中档 70% 集**（含 30%）：primitives 38 + composites 19 = **57**。
- **高档 100% 全量**（含 70%,除 `icon` 特殊）：primitives 46 + composites 25 = **71**。
- 分母 = 47 primitives + 25 composites = 72（`icon` 特殊不计、9 个整页 pattern 不进速查）。
- 三档各出一份速查(都提交)+ 对应档的壳。数字仅参考,以本表标记为准。

> 数字仅参考;**以本表标记为准**,你手调 `30/70/—` 即改覆盖范围。

---

## 六、漂移检测（foundation 迭代时）

foundation 升级后跑漂移检测,对比"上次记录 vs 当前 `release/`":

- 比 `manifest.json` 的 `version`/`sourceCommit` → 判 release 是否更新。
- 比 `catalog.json` 组件清单 → 报：🆕 新增（本表追加,标 `—` 待定）· 🗑️ 移除（本表删）。
- 比每个"已纳入(30/70)"组件的**签名**（其 class 集 + 源范例文件哈希）→ 变了报 ✏️「骨架需重做」。
- 输出一份"需补/需改骨架"清单给操作员,不自动改骨架库。

---

## 七、快速刷新命令（一条命令刷新 3 档速查 + 壳）

**刷新命令（待建）= 组件库的"一键刷新"**。何时跑:foundation 升级后 / 手调本表后 / 骨架库更新后。**只读本表**:

对每一档 T ∈ {30, 70, 100}:
1. 取所有标记 ≤ T 的组件(累积:30 档取 `30`;70 档取 `30`+`70`;100 档取全部)。
2. **名字/vocab**：从 `release/catalog.json` 实时抄(自动跟 foundation)。
3. **骨架**：从骨架库取(库缺 → 报"该组件缺骨架,先蒸馏",不静默漏)。
4. 拼出该档速查文件 + 用同一组件集驱动 `build-netshell` 出该档壳(同源)。

产出 3 份速查(低/中/高,都提交) + 3 档壳配方。**跑一次刷新全部**;`icon` 恒不进速查(经 icon.mjs)。

> **构建物**:刷新命令 + 骨架库 + 漂移检测 是后续实现(走独立 plan)。本表 + 骨架库是它们的输入。三档速查文件命名与入口选档映射见 `SKILL.md` 入口 / `foundation-set.md`。

## 适用角色

BA/SA（手调本表、跑生成命令与漂移检测）。
