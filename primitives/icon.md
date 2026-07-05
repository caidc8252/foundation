# Icon

An inline [Lucide](https://lucide.dev) SVG used as a glyph inside another control or beside text. The only icon vocabulary in this system.

> **Contract scope.** This file is the cross-consumer *design contract*: which
> icon set, the canonical markup, how to choose and obtain one, sizing, a11y.
> The artifact inlines the SVG; the Next implementation imports from
> `lucide-react`. When the contract and an implementation disagree, the contract
> is right and the implementation is a bug.

## The set

Icons are **Lucide** — the exact set vendored under `scripts/icon/data`
(pinned in `scripts/icon/data/VERSION`). That is the closed set: a name that
is not a Lucide icon **does not exist** here. Icons are raw material like
tokens, not a class layer — there is no `.icon` class to apply.

Self-contained artifacts can't reach an icon font, an external sprite, or a CDN
(CSP blocks them), so **every icon is an inline `<svg>`**, pasted verbatim.

## The four jobs — does this earn an icon?

An icon does **exactly one** of four jobs. If a glyph isn't doing one of these, it is
decoration-creep — **drop it**. This restraint is what keeps a screen from turning into
icon soup, and it decides both *whether* an icon belongs and *which* one:

| job | what the icon does | where it lives | which glyph | colour |
|---|---|---|---|---|
| **1 · Action** | names a **verb** the user invokes | a button / control | §Conventional action icons | `currentColor`; tone from the host control |
| **2 · Status** | signals **severity / state** | a message container — alert · toast · callout · timeline node · inline validation — **not a badge** | §Status glyphs | inherits the container's semantic tone |
| **3 · Identity** | names **what a thing is** (its entity / type) | leading a title / row / tile / nav item, an input affix | one canonical glyph **per type** (§Identity & domain glyphs) | neutral / `currentColor` |
| **4 · Decoration** | an **empty-state mark** or feature bullet | empty-state · feature list — never load-bearing | pick by meaning, larger size | muted / `currentColor` |

- **Restraint — the default is no icon.** A heading, field label, or plain sentence that
  already reads clearly does **not** get a leading icon "for balance". Add one only when it
  does one of the four jobs.
- **Boundary · status — dot vs icon.** A **compact status label** carries a **dot**, never
  an icon — that is the badge's rule ([`badge.md`](./badge.md): a status's marker is the
  dot). Status becomes an **icon** only in a **message container** (alert / toast / callout /
  timeline) that has the room and where the glyph aids recognition. A chip is too small to
  earn a glyph; a message earns one. Never both. So `triangle-alert` warns *in an alert*,
  while a warning *badge* is a `warning` dot — same severity, two carriers, no glyph to drift.
- **Boundary · action — icon-only vs icon + text.** Go icon-only when the verb is in
  §Conventional action icons **and** space is tight (a `data-table` row, a toolbar, a `⋯`
  trigger) **and** the control carries an `aria-label` + hover `title`. Otherwise use
  icon + text (primary CTAs, less-conventional verbs). An abstract verb with **no**
  conventional glyph (Manage, Assign, Rotate key) stays text or routes into the `⋯` menu
  (see [`actions.md`](../patterns/actions.md)).

## Don't hand-write icons — get them

Two failure modes the tooling exists to prevent: an **invented name** and a
**hand-typed (wrong) path**. So never write the SVG from memory:

```bash
# 1 · find a name by meaning — tags are English, so translate the intent first
#     ("删除" → "delete", "保存" → "save")
node scripts/icon/icon.mjs search delete      # → trash-2, x, eraser, …

# 2 · paste the exact markup it prints
node scripts/icon/icon.mjs get trash-2
```

Pick the name whose meaning fits — favor the conventional choice (delete →
`trash-2`, edit → `square-pen`, search → `search`, more → `ellipsis`, success →
`circle-check`, settings → `settings`). When unsure, `search` and read the tags.

## Conventional action icons

For the recurring verbs in admin/CRUD prototypes, use these names — they keep the
same glyph meaning the same thing across screens. **Tone is carried by the host
control, not the SVG**: a `danger` action is a `ghost-danger`/`danger` button (the
icon inherits its `currentColor`); never color the icon. The `confirm` column is
the destructive-action policy — light confirm (a popover/quick confirm) vs.
**confirm + requireText** (a modal that requires typing to proceed).

| action | lucide name | meaning | tone | reversible | pair / restore | confirm |
|---|---|---|---|---|---|---|
| Edit | `square-pen` | 编辑字段 | neutral | — | — | — |
| View details | `eye` | 查看详情（轻量入口弹窗） | neutral | — | — | — |
| Copy | `copy` | 复制 ID / 链接等 | neutral | — | — | — |
| Lock / Unlock | `lock` / `lock-open` | 锁定 / 解锁 | neutral | 可逆 | 互配 | 轻确认 |
| Suspend / Resume | `circle-pause` / `circle-play` | 暂停 / 恢复 | danger / neutral | 可逆 | 互配 | 轻确认 |
| Link / Unlink | `link` / `unlink` | 关联 / 取消关联两实体（tooltip 表明关联对象） | neutral | 可逆 | 互配 | 轻确认 |
| Cancel | `x` | 取消进行中 / 待处理项 | danger | — | — | 轻确认 |
| Revoke | `ban` | 作废凭证 / 令牌 | danger | 不可逆 | — | **确认 + requireText** |
| Terminate | `ban` (tooltip 区分) | 终止并归档（进行中的协议 / 对象） | danger | 不可逆 | — | **确认 + requireText** |
| Delete | `trash-2` | 永久删除记录 | danger | 不可逆 | — | **确认 + requireText**（行内图标维持 danger 红） |
| More | `ellipsis` | 展开 kebab 菜单 | neutral | — | — | — |
| Alert / Warn | `triangle-alert` | 警告提示 / 风险提示 | danger | — | — | 轻确认 |
| Back | `chevron-left` | 返回上一层 / 上一步 | neutral | — | — | — |
| Next | `chevron-right` | 进入下一步 / 下一页 / 查看二级页面 | neutral | — | — | — |
| Download | `download` | 下载文件 / 导出内容 | neutral | — | — | — |
| Upload | `upload` | 上传文件 / 导入内容 | neutral | — | — | — |
| Search | `search` | 搜索 / 查询 | neutral | — | — | — |
| Add / Create | `plus` | 新增 / 创建条目 | neutral | 部分 | Delete | — |
| Refresh | `refresh-cw` | 刷新 / 重载 / 重新同步 | neutral | 可逆 | 自身重载 | — |
| Time / History | `clock` | 时间 / 记录 / 最近操作入口 | neutral | — | — | — |
| Info | `info` | 信息说明 / 帮助提示 | neutral | — | — | — |
| Calendar | `calendar` | 日历 / 日期选择 | neutral | — | — | — |
| Check | `check` | 确认 / 完成状态 | neutral | — | — | — |
| Chevron down | `chevron-down` | 下拉 / 展开 / table 表头降序排序 | neutral | — | — | — |
| Chevron up | `chevron-up` | 收起 / 折叠 / table 表头升序排序 | neutral | — | — | — |
| Chevrons up/down | `chevrons-up-down` | 排序 / 上下切换 / table 可排序表头默认状态 | neutral | — | — | — |
| Funnel | `funnel` | 筛选 | neutral | — | — | — |
| Loader | `loader-circle` | 加载中 | neutral | — | — | — |
| Minus | `minus` | 减少 / 移除一项 | neutral | 部分 | Add | — |
| Shield | `shield` | 安全 / 权限 / 防护 | neutral | — | — | — |
| Save | `save` | 保存草稿 / 持久化改动 | neutral | — | — | — |
| Play / Pause | `play` / `pause` | **即时**启动 / 暂停一个任务或媒体（区别于 Suspend/Resume 的**状态翻转**） | neutral | 可逆 | 互配 | — |
| Redo / Rotate | `rotate-cw` | 重做 / 重试 / 旋转 | neutral | — | — | — |
| Power | `power` | 开 / 关 / 重启设备 | neutral（关机类 danger） | 可逆 | — | 破坏性方向轻确认 |
| Sign out | `log-out` | 退出登录 | neutral | — | — | — |
| Open external | `external-link` | 在**新标签**打开外部链接 | neutral | — | — | — |
| Help | `circle-question-mark` | 打开帮助 / 说明入口 | neutral | — | — | — |
| Move / Reorder | `arrow-left` `arrow-right` `arrow-up` `arrow-down` | 方向移动 / 重排 / 趋势 / 翻页 —— **arrow = 移动/方向；chevron = 展开/层级**，别混用 | neutral | — | — | — |

> Two names differ from a common older list: `more-horizontal` and
> `alert-triangle` were renamed in Lucide — in the pinned set they are
> `ellipsis` and `triangle-alert`. The table already uses the valid names; the
> checker rejects the old aliases.

## Status glyphs

Job 2. When a **message container** (alert · toast · callout · timeline node · inline
validation) leads with a severity glyph, use **one glyph per severity** — the same across
every container, so severity reads identically everywhere:

| severity | glyph |
|---|---|
| success | `circle-check` |
| warning | `triangle-alert` |
| error | `circle-x` |
| info | `info` |

The glyph inherits the container's tone (via `.alert__icon` etc.) — never colour the SVG.
A **badge does not use these** — a compact status label carries a **dot** (`badge.md`).
Same severity, two carriers: `triangle-alert` in an alert, a `warning` **dot** in a badge.

## Identity & domain glyphs

Job 3. An identity glyph names **what a thing is** — its entity type. Unlike actions and
status, entity types are **open-ended** (device, firmware, merchant, order…), so no global
table can enumerate them — and that open set is exactly where icons drift, each author
picking a different glyph for "device". The pin:

- **One canonical glyph per entity type, declared once and reused.** Choose it with
  `icon.mjs search <entity>`, favour the obvious Lucide name, and use the *same* glyph
  everywhere that type appears — never vary it row to row or screen to screen.
- **Domain-specific types** (device, terminal, firmware, SIM, merchant…) are **not** in the
  foundation vocabulary. Declare them **once per artifact** — a small type→glyph legend at
  the top of the mock — and reuse; that per-artifact pin is what keeps them stable.

These recur across admin portals; reuse the canonical pick so a type doesn't drift
*between* artifacts. A glyph can also serve an **action** job elsewhere (e.g. `clock` =
Time/History action *and* a "time" entity) — that's fine; the job is set by context.

**Entity / object glyphs** — name *what a record is*, leading a title / row / tile / nav item:

| glyph | 用在什么情况（它命名的东西） |
|---|---|
| `user` | 一个人 / 账号 |
| `users` | 一组人 / 团队 / 成员列表 |
| `user-round` | 平台操作员 / 客服 / 坐席（仅当需与"客户 `user`"区分时） |
| `building-2` | 公司 / 组织 / 租户 |
| `file` | 单个文档 / 附件 |
| `folder` | 文件夹 / 一组条目 |
| `database` | 数据库 / 数据集 / 存储 |
| `tag` | 标签 / 分类 / SKU |
| `ticket` | 工单 / 券 / 票 |
| `receipt` | 收据 / 交易记录 |
| `shopping-cart` | 订单 / 购物车 |
| `package` | 应用包 / 发货包裹 |
| `gift` | 促销 / 奖励 / 礼包 |
| `banknote` | 金额 / 支付 / 现金 |
| `key` | 凭证 / API Key / 密钥 |
| `mail` | 一封邮件 |
| `message-square` | 会话 / 评论 / 消息串 |
| `image` | 图片 / 媒体资源 |
| `map` / `map-pin` | 地图 / 一个具体位置 |
| `globe` | 全局 / 区域 / 公开 |

**Device & telemetry glyphs** — the hardware domain (canonical picks for the *recurring*
ones; a genuinely bespoke type still declares per artifact):

| glyph | 用在什么情况 |
|---|---|
| `tablet` | POS 终端 / 平板设备（DEVICES 域的"设备"，含原型 `pos`） |
| `smartphone` | 手机 / 移动设备 |
| `monitor` | 显示器 / 屏幕 |
| `server` | 服务器 / 后端节点 |
| `cpu` | 处理器 / 算力 |
| `battery` | 电量 / 电池状态 |
| `zap` | 供电 / 充电 / 高速 —— ⚠ 闪电用 `zap`，**不是** Lucide 的 `bolt`（那是螺丝） |
| `wifi` | WiFi 连通性 |
| `ethernet-port` | 有线 / 以太网连通 |
| `signal` | 蜂窝信号 |
| `cloud` | 云端 / 远程 |
| `volume` | 音量 |
| `activity` | 实时遥测 / 心跳 / 活动流 |
| `truck` / `plane` | 陆运·发货 / 空运 |

**App chrome / global-nav glyphs** — the persistent shell: a destination, or a global toggle:

| glyph | 用在什么情况 |
|---|---|
| `house` | 首页 / 仪表盘入口（Lucide 用 `house`，不是 `home`） |
| `grid-3x3` | 网格视图 / 应用宫格 |
| `bell` | 通知入口 |
| `settings` | 设置 / 配置 |
| `shield` | 安全 / 权限中心 |
| `sun` / `moon` | 浅色 / 深色主题切换 |
| `accessibility` | 无障碍选项 |
| `life-buoy` | 帮助 / 支持中心 |
| `sparkle` / `sparkles` | AI / 智能生成 / 新特性高亮 |

### On the categories — do the four jobs still fit?

Adding the prototype's ~50 glyphs, the four jobs (Action · Status · Identity · Decoration)
still hold; the additions are almost all **Identity** (they name a type or a destination).
Two clarifications and two things that are **not** an icon job:

- **Sidebar / section nav icons are Identity** — they name the destination's *type*
  (Devices → `tablet`, Orders → `shopping-cart`), not an action.
- **Chrome utilities that toggle are Action** — `sun`/`moon` (theme), `bell` (open
  notifications) trigger something; they just live permanently in the shell.
- **`sparkle` / `sparkles` straddle Identity and Decoration** — as an "AI feature" marker
  it's Identity; as a sprinkle of visual flourish it's Decoration (and then it's optional).
- **A radio dot is NOT an icon job.** The prototype's `radioOn`/`radioOff` (`circle-dot` /
  `circle`) are the *selected state of a radio control* — that belongs to the form-control
  primitive, not this icon vocabulary; don't catalog it as an icon.

## Anatomy

The canonical inline icon — `data-lucide` is the **first** attribute (the
semantic name: what you grep, what the checker keys on, the Next.js bridge):

```html
<svg data-lucide="search" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
</svg>
```

- **Color** is `stroke="currentColor"` — the icon inherits the text color of its
  context. Never set a color literal or a fill (it would fail the checker).
- Drop it into a slot that already styles icons (`.btn`, `.alert__icon`,
  `.input-group`, an input affix) and it is sized/colored for you.

## Sizing

- Inside a primitive that sizes icons (e.g. `.btn svg` → 14px), **add nothing** —
  the slot wins. An explicit size on the `<svg>` overrides it.
- Standalone (empty-state mark, feature bullet, list affix), set the box with
  `width`/`height` on the `<svg>` — `width="20" height="20"`, or a space token
  via inline style (`style="width:var(--space-5);height:var(--space-5)"`). A
  raw px dimension is allowed; a color literal is not.
- Keep `viewBox="0 0 24 24"` — it is the coordinate space, not the render size.

## Accessibility

- **Decorative** (label or accessible control beside it): add `aria-hidden="true"`.
- **Meaningful** (icon is the only content, e.g. an icon-only button): the icon
  stays `aria-hidden`; put the name on the control via `aria-label` (see
  `button.md`). A standalone informational icon takes `role="img"` +
  `aria-label="…"`.

## Governance — can't find an icon?

The set is full Lucide (1700+ icons), so a true gap is rare — a miss almost
always means the wrong search word. **Try other English terms before concluding
it's missing**: synonyms and related concepts (delete → `remove` → `trash`;
user → `person` → `account`; more → `ellipsis` → `menu`). Re-run
`icon.mjs search` with a different word each time.

If **three** different searches still surface nothing that fits, **stop and
report the gap to a human** — name the concept and the words you tried. Do not:

- substitute a hand-drawn or non-Lucide SVG (recreates the drift this foundation removes);
- run `scripts/icon/refresh.mjs` or change the pinned Lucide version.

**Version upgrades are a human maintainer decision, never an automated or AI
step.** The set is pinned in `scripts/icon/data/VERSION` and vendored into the
repo; nothing fetches it at build/check/author time. A maintainer (not an agent)
bumps it deliberately via `scripts/icon/refresh.mjs <version> --yes` followed by
`pnpm build`, and reviews the diff.

## Implementations

- **Next / @cloud/ui** — import from `lucide-react`; the component is the
  **PascalCase** of `data-lucide` (`search` → `Search`, `trash-2` → `Trash2`,
  `square-pen` → `SquarePen`). Replace the inline `<svg data-lucide="x">…</svg>`
  with `<X />` and drop the path markup; pass size via the React convention
  (`className="size-4"`). The `data-lucide` attribute is exactly the mapping
  key, so the swap is mechanical:

  ```tsx
  // prototype:  <svg data-lucide="search" …>…</svg>
  import { Search } from "lucide-react";
  <Search className="size-4" aria-hidden />
  ```

  Ensure the app's `lucide-react` is recent enough to export every name the
  prototype uses (its icon set must cover the vendored Lucide version above).
- **Artifact (self-contained HTML)** — inline the `<svg>` from
  `node scripts/icon/icon.mjs get <name>`, verbatim, keeping `data-lucide` first.
  Validated by `node scripts/check-artifact.mjs` (unknown name → fail; altered
  path → fail under `check-artifact.mjs --strict`).
