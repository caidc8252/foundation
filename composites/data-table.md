# Data table · composite

The workhorse of the list pattern: rows you scan, sort, select, and act on. A
config-driven table — columns + rows — not hand-written cell markup.

> **Contract scope.** Cross-consumer contract: anatomy, density, states, the
> framed appearance, a11y. NOT the React generics/prop types (`@cloud/ui` + `ui`
> skill). Contract wins over either implementation.

## Anatomy

```
┌ table-frame ──────────────────────────────────────────────────────┐
│ ☐ │ Header ▴   Header        Header                               │  ← thead (sticky); trailing col is HEADERLESS
├───┼────────────────────────────────────────────────────────────────┤
│ ☑ │ cell        cell          cell               [🔒] [⋯]  ›    │  ← ONE trailing cell: icon verb(s)/⋯ menu then passive chevron
│ ☐ │ cell        cell          cell                          ›    │  ← nav-only row: the same cell, chevron alone
│ ☐ │ cell        cell          cell               [🔒] [⋯]       │  ← act-only row: icon verb(s), no chevron
└────────────────────────────────────────────────────────────────────┘
```

The **trailing cell** (`.row-actions`) is the row's operations: a single headerless,
right-aligned cell holding — in source order — any inline verbs, then a **passive
`.cell-chevron`** (last) when the row navigates. Inline verbs and the chevron
**coexist in this one cell**; the chevron is a *navigate affordance rendered as an
icon* — never its own column, never a button.

## Density

| preset | cell padding (inline / block) | use |
|---|---|---|
| `compact` | `space-3` / `space-2` | ops / data-dense screens |
| `comfortable` *(default)* | `space-4` / `space-3` | standard |
| `spacious` | `space-4` / `space-4` | reports |

> The space ladder has no 6px, so `compact` block-padding snaps to `space-2` (8px)
> rather than @cloud/ui's raw 6px. On-scale beats pixel-exact.

## Rules

- **Framed appearance** — wrap in `.table-frame` (rounded-xl + `line-default`
  border + `surface-2` + `shadow-1`, corners clipped). Header is `surface-3`,
  `text-xs` / weight 500 / UPPERCASE / `tracking-overline` / `content-tertiary`.
- **Sort** is tri-state per column: unsorted → asc → desc → unsorted. The active
  column shows a primary-tinted chevron; sortable-but-inactive reveals a dim
  chevron on hover.
- **Selection is opt-in** — add the leading `col-select` checkbox column **only
  when the table supports multi-row (bulk) operations**; a table with no bulk ops
  has **no checkbox column** (never a default). When present, the selected row
  gets `state-selected` background + a 2px primary left bar (`shadow-row-selected`),
  and drives a bulk-action bar (in the summary bar / page header).
- **One trailing cell carries both the verbs and the chevron.** The row's
  operations — inline verbs *and* the navigate chevron — live in a **single**
  `.row-actions` `<td>` at the row end, never in two competing cells. Its `<th>` is
  **headerless** (`aria-hidden="true"`, no label — quick verbs don't earn a column
  title), and the cell is **right-aligned by the class itself** (`.row-actions` bakes
  `text-align:right`; you no longer add `.cell-right`) so the cluster hugs the row
  edge instead of floating at the left of a stretched last column. Inside, a
  **`.row-actions__inner`** flex wrapper lays out, in source order: any inline verbs,
  then — when the row navigates — a **passive `.cell-chevron` last** (§ Column recipes).
  The wrapper supplies the gap + vertical centering; bare siblings dropped straight
  into the cell butt together with no gap. This holds for the collapsed single `⋯`
  carrier too. A **nav-only** row uses the same cell with just the chevron inside; an
  **act-only** row omits the chevron. Never give the chevron its own cell beside the
  verbs, and never split a navigating-with-quick-ops row into two trailing cells.
- **Row actions are always visible** — a table with a trailing action cell is operated
  in place, so its verbs are never hidden behind hover. **Hover-reveal is not a table
  behavior**: it belongs to an info-first **list** (a self-authored `list-item` whose
  actions stay out of the way until hover), not a `data-table`.
- **Row-action variant: quick verbs are icon-only, never a `secondary` text button.**
  An always-visible row action is a **ghost icon button** (`btn--ghost btn--icon-sm`)
  carrying a conventional Lucide glyph (from `icon.md`'s action table) plus an
  `aria-label` and a hover `title` — a **destructive** one (delete / terminate /
  revoke) is `ghost-danger` (still red) and confirms. Only a verb with a
  **near-universal** glyph goes inline (Edit `square-pen`, Lock `lock`, Delete
  `trash-2`, Revoke `ban`); an **abstract** verb with no conventional icon
  (Manage, Assign, Rotate key) is **not** given a guessed glyph — it moves into the
  trailing **`⋯` (`ellipsis`) menu**, where an icon+label row removes the ambiguity.
  Past ~2 inline icons, collapse to the single `⋯` menu (one carrier per row).
  (Mirrors [`actions.md`](../patterns/actions.md) and the `list-page` row recipe.)
- **Numeric / id columns** render mono + tabular (`.cell-num`) and usually
  right-align so digits line up.
- **Sticky header** docks the column header to the scroll root; pair with a
  `--flush` frame and set its top offset to the summary bar's height so they tile.
  Wide tables scroll **inside `.table-scroll`** — the page never scrolls sideways.
  That scroll root is `.app-frame__main` in the shell; a **frameless** page must
  give its own `overflow-y:auto` root or drop `--sticky-head` + the `top:` offset
  (see `.claude/docs/artifact-build-guide.md` §6 "frameless shell 的 sticky 滚动根").
- **Pagination is `simple`** — the list/table footer shows `‹ Prev · current page
  · Next ›` only (no numbered jump, no ellipsis); it is `RichPagination`, which is
  always simple. The total lives in its range summary. See `pagination.md`.
- **Empty / loading** are not the table's job to invent — render `empty-state`
  in place of rows, or a `skeleton` table while loading.

## Column recipes

Common column shapes — compose cell content from tokens; never invent an
off-scale type/color pairing.

| column | recipe |
|---|---|
| **two-line text** (primary + sub, e.g. name + id) | `.cell-2line` (`min-w-0`): main `.cell-2line__main` `text-lg` / `500` / `content-primary` truncate · sub `.cell-2line__sub` `text-xs` / `content-tertiary` truncate. A leading `object-tile` / logo → `gap-3`. |
| **numeric / date / id** | `font-mono` `tabular-nums` `content-secondary`, right-aligned (`.cell-num` + `.cell-right`) so digits line up. |
| **plain text** | table default size + `content-secondary`. |
| **tag / multi-badge set** | one wrapping row of `badge`s — `flex flex-wrap gap-1` (`.cell-tags`). |
| **trailing chevron** (row navigates) | a passive `ChevronRight` in `content-tertiary`, `aria-hidden`, that lives **inside the trailing `.row-actions` cell as the last child of `.row-actions__inner`** — never its own `<td>`. `.cell-chevron` sets only the tint + arrow size; the right-alignment comes from `.row-actions`. The **whole row** is the click target (the chevron is not a button). Inline verbs may sit to its left in the same cell — a row can act *and* navigate; when it does, the verbs `event.stopPropagation()` so a verb click doesn't also fire the row's navigate. |

- **Empty value** — render an em-dash `—` in `content-tertiary` (`.cell-empty`), never a blank cell.
- A stable new column type (progress, risk level…) is a shared column component, not a per-page restyle — propose it rather than hand-rolling cell markup.

## Implementations

- **Next / @cloud/ui** — `Table<R>` with `columns` / `rows` / `rowKey`; variants
  `density` `striped` `bordered` `stickyHeader` `stickyHeaderTop` `stickyFirstColumn`
  `rowState`. Prefer the typed config over manual `<table>`. `ui` skill → data-display.
- **Artifact** — `.table-frame` › `.table-scroll` › `table.data-table` with
  `--compact`/`--spacious`, `--sticky-head`, `--sticky-col`, `--striped`; cells
  `.cell-num`/`.cell-right`/`.cell-2line`/`.cell-tags`/`.cell-empty`,
  `.row-actions` (the single headerless trailing cell; self-right-aligns — no
  `.cell-right` needed — and wraps its verbs **and** a trailing passive
  `.cell-chevron` in `.row-actions__inner`), `.col-select`. In `composites.css`.
  `--sticky-head` th carry their own opaque `surface-3` background (a pinned th
  detaches from the thead's, so rows would otherwise bleed through); when paired
  with a sticky summary bar, give the th a `top` equal to the bar's height
  (`--space-12`) and keep both in one scroll container so they tile.
