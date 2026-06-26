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
| Suspend / Resume | `pause` / `play` | 暂停 / 恢复 | danger / neutral | 可逆 | 互配 | 轻确认 |
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

> Two names differ from a common older list: `more-horizontal` and
> `alert-triangle` were renamed in Lucide — in the pinned set they are
> `ellipsis` and `triangle-alert`. The table already uses the valid names; the
> checker rejects the old aliases.

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
  `.breadcrumb`, an input affix) and it is sized/colored for you.

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
