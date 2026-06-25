# Data table · composite

The workhorse of the list pattern: rows you scan, sort, select, and act on. A
config-driven table — columns + rows — not hand-written cell markup.

> **Contract scope.** Cross-consumer contract: anatomy, density, states, the
> framed appearance, a11y. NOT the React generics/prop types (`@cloud/ui` + `ui`
> skill). Contract wins over either implementation.

## Anatomy

```
┌ table-frame ─────────────────────────────────────────────────┐
│ ☐ │ Header ▴   Header        Header            〔row actions〕│  ← thead (sticky)
├───┼───────────────────────────────────────────────────────────┤
│ ☑ │ cell        cell          cell                       ⋯ ✎  │  ← selected row
│ ☐ │ cell        cell          cell                            │
└───────────────────────────────────────────────────────────────┘
```

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
  `text-xs` / weight 600 / `content-tertiary`.
- **Sort** is tri-state per column: unsorted → asc → desc → unsorted. The active
  column shows a primary-tinted chevron; sortable-but-inactive reveals a dim
  chevron on hover.
- **Selection is opt-in** — add the leading `col-select` checkbox column **only
  when the table supports multi-row (bulk) operations**; a table with no bulk ops
  has **no checkbox column** (never a default). When present, the selected row
  gets `state-selected` background + a 2px primary left bar (`shadow-row-selected`),
  and drives a bulk-action bar (in the summary bar / page header).
- **Row actions** sit at the row end and are **always visible** — a table with an
  action column is operated in place, so its verbs are never hidden behind hover.
  **Hover-reveal is not a table behavior**: it belongs to an info-first **list** (a
  self-authored `list-item` whose actions stay out of the way until hover), not a
  `data-table` action column. (A list whose rows are primarily a **navigation**
  target carries no action column at all — just a trailing chevron; the row click
  navigates — see `list-page`.)
- **Row-action variant: a text verb is `secondary`, never bare `ghost`.** An
  always-visible row action must read as a button at rest, so a **text** row verb is
  a `secondary` `xs` button — a **destructive** one (delete / terminate / revoke) is
  `danger` and confirms. Reserve `ghost` / `ghost-danger` for **icon-only** row
  actions. A `ghost` *text* verb reads as a link, not a control — don't use it for
  row actions. Past ~2 verbs, collapse to a single `⋯` menu (one carrier per row).
  (Mirrors [`actions.md`](../patterns/actions.md) and the `list-page` row recipe.)
- **Numeric / id columns** render mono + tabular (`.cell-num`) and usually
  right-align so digits line up.
- **Sticky header** docks the column header to the scroll root; pair with a
  `--flush` frame and set its top offset to the summary bar's height so they tile.
  Wide tables scroll **inside `.table-scroll`** — the page never scrolls sideways.
  That scroll root is `.app-frame__main` in the shell; a **frameless** page must
  give its own `overflow-y:auto` root or drop `--sticky-head` + the `top:` offset
  (see AGENTS.md "Two traps in a frameless page").
- **Pagination is `simple`** — the list/table footer shows `‹ Prev · current page
  · Next ›` only (no numbered jump, no ellipsis); it is `RichPagination`, which is
  always simple. The total lives in its range summary. See `pagination.md`.
- **Empty / loading** are not the table's job to invent — render `empty-state`
  in place of rows, or a `skeleton` table while loading.

## Implementations

- **Next / @cloud/ui** — `Table<R>` with `columns` / `rows` / `rowKey`; variants
  `density` `striped` `bordered` `stickyHeader` `stickyHeaderTop` `stickyFirstColumn`
  `rowState`. Prefer the typed config over manual `<table>`. `ui` skill → data-display.
- **Artifact** — `.table-frame` › `.table-scroll` › `table.data-table` with
  `--compact`/`--spacious`, `--sticky-head`, `--sticky-col`, `--striped`; cells
  `.cell-num`/`.cell-right`, `.row-actions`, `.col-select`. In `composites.css`.
  `--sticky-head` th carry their own opaque `surface-3` background (a pinned th
  detaches from the thead's, so rows would otherwise bleed through); when paired
  with a sticky summary bar, give the th a `top` equal to the bar's height
  (`--space-12`) and keep both in one scroll container so they tile.
