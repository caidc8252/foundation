# Pattern · List page

The default archetype for "a collection you browse, filter, and act on" (the most
common portal screen). A pattern is a *named structure*, not an implementation —
both consumers build it from composites; this file fixes the anatomy, the
ordering, and the load-bearing decisions so a prototype and the production page
read as the same screen. Reference implementation: the `@cloud/ui` list-page
example (the style template — see the `ui` skill).

> 📐 **Copyable examples**
> - [`list-page.html`](./list-page.html) — the `simple` variant: full anatomy assembled
>   from composites (shell → header → condition band → list card; the sticky stack is
>   page-header → summary bar → sticky-head table, plus rich pagination; empty/loading
>   swap snippets included).
> - [`list-page-advanced-filter.html`](./list-page-advanced-filter.html) — the
>   `advanced-filter` variant: adds an Advanced (secondary) trigger that opens a
>   right-side drawer sheet; fully interactive (Apply → chips, chip ✕, Clear all, Escape/overlay dismiss).
>
> Both **link** the reference CSS so they never fork; inline the blocks to ship as an artifact. All examples: [`index.html`](./index.html).

## Anatomy (top → bottom)

The diagram shows a **fully-dressed** instance — every band a list page *can*
carry. Only two are the required core (marked `■`); the rest are optional
(marked `○`, with a trailing `?`) and render only when this list's job calls for
them. See "Required core / optional slots" below for the exact split.

```
┌ ■ page-header (full-bleed) ──────────────────────────── ◄ stick┐
│ Title  [count?]                  [secondary?]  [ primary? ]  │
│ [description?]                                               │
╞ page-body (gutters + stack) ═════════════════════════════════╡
│ ○ [banner?]  status Alert gating the whole collection        │
│ ○ [segment tabs?]  All / Pending / Approved … (queue)        │
│ ○ [metric strip?]  KPI stat-cards summarizing the collection │
│ ┌ ○ condition band? ───────────────────────────────────────┐ │
│ │ [ 🔍 search ] [ quick filter ▾ ] [ Search ]    [Advanced?]│ │
│ │ Filters:  ⊗ chip   ⊗ chip  clear all                      │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌ ■ results card (table-frame --flush) ────────────────────┐ │
│ │ summary bar:  N customers …            [ Export? ]   ◄ stick│ │
│ │ ☐ CUSTOMER ▴   STATUS   REGISTERED   CITY   TAGS      ◄ stick│ │
│ │   row …  (row click → ○ peek-drawer?)                 › │ │
│ │ ─ pagination: rows ▾  Showing 1–25 of N     ‹ 1 2 3 › ── │ │
│ └───────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
   ■ required core   ○ optional — included per business need
```

The condition band and the results card are **bound together in a `.stack--4`
wrapper** — they sit `space-4` (16px) apart, tighter than `page-body`'s `space-6`
rhythm, because the band conditions *that* card (principles §13). The bound unit is
then one block in `page-body`'s stack; drop the wrapper if this list omits the
condition band (a lone results card sits directly in `page-body`).

## Required core / optional slots

A list page is a **framework**, not a filled-in screen (governance principle
[#9 — *Patterns are frameworks*](../governance/principles.md#9-patterns-are-frameworks)):
it guarantees the structure and ordering above, never that every band is
present. The split below is authoritative — this contract declares it; treat it
as the source of truth, don't re-derive it elsewhere. Only the **header** and the **results card** are the minimal
required core; everything else is included only when this list's job calls for
it. A list with no filtering, no banner, no tabs, and no KPIs — just a header and
a table — is still a complete, correct list page.

| slot | required? | include when |
|---|---|---|
| `page-header` (title + at-most-one primary action) | **yes** | always — names the collection; title required, primary action optional (a read-only list has none) |
| results card — summary/count bar · table · pagination | **yes** | always — the count bar, table, and pagination are the results block's required internals |
| status `banner` (Alert under the header) | no | a page-level state gates the whole collection (e.g. "verification pending") |
| segment tabs (the `queue` variant) | no | the collection is browsed by status/queue and tabs re-scope it (All / Pending / …) |
| `metric-strip` (top KPI row) | no | a few collection-level KPIs are worth surfacing above the list |
| condition band (search + quick filters + applied chips) | no | this list needs filtering — **omit it entirely for a list with no filters** |
| Advanced filter trigger + drawer (the `advanced-filter` variant) | no | filter dimensions outgrow the inline toolbar and need a sheet |
| row → peek-drawer (row click opens a side quick-detail) | no | a quick look at a row is useful without leaving the list |
| selection (leading `col-select` checkbox column + bulk-action set) | no | the list supports **multi-row / bulk operations** — **omit the checkbox column entirely** for a list with no bulk ops |
| summary-bar `Export` (a secondary action) | no | the current filtered result is worth exporting |

## Sticky model (the load-bearing decision)

Three layers stay docked at the scroll-root top, stacked in document order —
**page-header → summary bar → table column header**. The condition band (when
present) is **not** in the stack: it scrolls away under the sticky page-header.
Each layer's top offset is the **total height of the sticky layers above it**, so
the three tile flush with no gap or overlap:

- The **page-header** is `--sticky` (`top: 0`) — it is the top of the stack.
- The **summary bar** is `--sticky`; its top offset is the **page-header's
  height**. The **table** uses a `--sticky-head` whose top offset is the
  **page-header + summary bar** height. The summary bar's own height is a token
  (`LIST_SUMMARY_BAR_HEIGHT = 48 = --space-12`); the page-header's height is
  **content-driven** (title + optional description + padding) with **no clean
  token** — so a page carrying a sticky header sets a page-local
  `--lp-header-h` equal to its **measured** page-header height and derives the two
  offsets from it (`summary-bar top: var(--lp-header-h)`; `thead top:
  calc(var(--lp-header-h) + var(--space-12))`). Re-measure whenever the header
  content changes (drop the description, wrap the title, add/remove actions).
- The list card is a `table-frame` in its **`--flush`** form (`overflow: clip`,
  not the default `hidden`) — flush still rounds the corners but does **not**
  establish a scroll container, so the sticky bar and header dock to the page
  instead of being trapped inside the card. A wrapping `.card` (which is
  `overflow: hidden` = a scroll container) would re-introduce that trap, so the
  results card **is** the bare `table-frame --flush`, never a `.card` around it.
- The card adds **no padding** — summary bar, table, and pagination each own
  their own, and butt against the frame edges.

## Rules

- **At most one primary action — never a required one**, top-right in the
  page-header (`Button` variant `primary`, e.g. "New customer") — present when the
  list supports creating a record, omitted for read-only / reference lists. The
  condition band's Search button (when a condition band is present), the
  Advanced filter trigger, and the summary bar's Export are all `secondary`;
  **bulk** actions (summary bar) are `secondary`, and a destructive one is
  **`ghost-danger`** (not the solid `danger` fill) so it doesn't out-weigh its
  `secondary` peers — one weight per action group ([`actions`](./actions.md) ·
  *A peer action group shares one weight*; the solid `danger` is the confirm dialog's
  Confirm). **Row-tail** actions are **icon-only** ghost buttons, not `secondary`
  text (see the row-action recipe below). Advanced is pushed to the far right
  of the toolbar by `condition-band__spacer` — visually separated from the
  primary filter flow, signalling it is the less-common path.
  Icon-only actions are `ghost` / `ghost-danger` only. The Advanced trigger is
  **optional** — omit it when all filter dimensions fit comfortably in the
  toolbar; add it only when extra criteria need a sheet (`advanced-filter` variant).
- **Page-header slots are business-driven** — only the title is required; every
  other slot is included per this list's job (see the
  [`page-header`](../composites/page-header.md) slot table). Most relevant here:
  - *Secondary action* (`page-header__actions` secondary `Button`): a page-level
    secondary verb (e.g. "Import"). Omit when no such verb exists for this
    collection; the primary CTA stands alone.
- **Search and filters submit on the Search button — not on change** (design law ·
  **principle 14** — global, and it also governs filtered tables embedded under
  detail-page tabs) — *when the condition band is present* (it is an optional slot —
  omit it for a list with no filtering). Typing in the search field or picking a quick filter only edits a
  **draft**; nothing runs until the user clicks **Search** (Enter in the search
  field also submits). The filter apparatus runs a **draft → applied** state
  machine (`useListFilters`): edits live in `draft`; `apply()` — the **Search
  button** — commits the whole draft to `applied` and resets to page 1; chips
  reflect `applied`. Removing a chip (`clearField`) or **Clear all** (`clearAll`)
  acts on the applied query and **re-runs immediately** (no Search click needed).
  Every applied criterion shows as a removable chip so the active query is always
  visible. When any filter is applied, the summary-bar count label appends
  "matching filters".
- **The whole row is the click target → it navigates to the record's detail page**
  (`onRowClick`). This is the load-bearing IA rule: **the list navigates; the detail
  page mutates.** The resting row carries only the leading select checkbox and a
  passive trailing chevron (`content-tertiary`) — **no in-row edit / delete**. A
  record's single-row verbs (Edit, Delete, status changes) live on the
  [detail page](./detail-page.md)'s `detail-header` actions, never on the list row;
  the list's only mutation path is **bulk** (selection → summary-bar `batch-action`).
  A side **peek-drawer** is the *optional* alternative to full navigation (see
  optional slots), not a home for row verbs.
- **Inline row actions are opt-in, and always-visible when present.** Add per-row
  verbs to the list only when a specific requirement emphasizes single-row quick ops
  (e.g. a high-throughput triage queue). They render **always-visible** at the row
  end — the [`data-table`](../composites/data-table.md) default (a table action
  column is never hover-hidden) — as **icon-only ghost buttons** (`btn--icon-sm` +
  a conventional Lucide glyph + `aria-label` + hover `title`), composed per
  [`actions.md`](./actions.md): ≤2 quick verbs → one ghost icon button each — a
  `ghost` **Edit** (`square-pen`) + a `ghost-danger` **Delete** (`trash-2`) — ≥3, or
  any abstract verb with no conventional glyph, → a single `⋯` overflow menu.
  **Delete stays `ghost-danger`** (still red, low-chrome) and opens a
  `confirm-danger` dialog. Every action `stopPropagation`s so it never triggers the
  row's navigate-to-detail.
- **Three text-column shapes**, and nothing else (keeps columns scannable):
  1. **Two-line** — primary `text-sm`/medium/`content-primary` over a subline
     `text-xs`/`content-tertiary`; may lead with an avatar / initial tile
     (`size-8`, `surface-3`, `rounded-lg`).
  2. **Numeric / id / date** — always mono + `tabular-nums`, `content-secondary`
     (the data-table `cell-num`); usually right-aligned so digits line up.
  3. **Plain** — table default size, `content-secondary`, **no** mono.
  **Badges encode meaning by kind:** a **status** value renders a *tonal* `Badge`
  (`success` / `warning` / `error` / `info`, with a `dot`); a **category / type /
  tag** value (e.g. plan, contract type, labels — single or multiple) renders a
  **`neutral`** `Badge` (no `dot`), so a category column never reads as a status.
  Tonal / colored badges are **reserved for status**. Empty values render an
  em-dash (`—`, `content-tertiary`), never a blank cell.
- **Empty, loading, error** are first-class states. *Nothing-yet* invites the
  page's primary verb; *no-results-for-filters* offers "clear filters", not
  "create". A `skeleton` table fills the frame while loading.
- **Selection is opt-in / business-driven** — add the leading `col-select`
  checkbox column **only when the list supports multi-row (bulk) operations**; a
  list with no bulk ops carries **no checkbox column** (never add one by default).
  When present, the selected row gets `state-selected` + a 2px primary left bar
  (`shadow-row-selected`) and drives a bulk-action set that replaces the summary
  bar's idle actions.
- Width is the shell's (`--container-content`); the **table** scrolls inside its
  own `table-scroll` region — the page never scrolls horizontally.

## Variants & optional slots

The required core is fixed (see "Required core / optional slots" above); the
archetype then stretches to denser screens through a few variants and the
optional slots already enumerated in that table. A variant changes how filtering
or navigation is *shaped*; an optional slot is a band that renders **only when
needed** — absent, the page reads exactly as a bare header + results card. The
list below restates the optional slots with the extra detail each needs.

**Variants**

- **`simple`** — when filtering is needed, a few filters are carried inline in the
  condition band (the shape the anatomy diagram illustrates). A list that needs
  no filtering at all drops the condition band entirely and is still a `simple`
  list page.
- **`advanced-filter`** — when filter dimensions outgrow the toolbar, the rare ones
  move into an **Advanced filter sheet** opened from a toolbar trigger (the
  [`list-filter`](../composites/list-filter.md) family's advanced trigger + sheet).
  The inline toolbar keeps only the common filters; everything still reflects into
  the same applied-filter chips. The sheet is a **[`sheet`](../primitives/sheet.md)**
  primitive (`.sheet` / `.sheet--right` / `.sheet__header` / `.sheet__footer`).
  The copyable example
  (`list-page-advanced-filter.html`) uses `.sheet--right` for its panel.
- **`queue`** — a row of **status-segment tabs** above the list (All / Pending /
  Approved …) whose selection drives the applied filter. These segment tabs are
  list-level navigation — they re-scope the collection — and are distinct from a
  detail page's content tabs (which switch panes within one record).

**Optional slots** (in anatomy order — each renders only when needed)

- **page-banner** — a status `Alert` (info / warning / error) directly under the
  page-header, for state that gates the whole collection (e.g. "verification
  pending"). Not a filter result; a page-level notice.
- **segment tabs** — the `queue` variant's status segments (see above), sitting
  between page-header and condition band.
- **metric-strip** — a top row of KPIs (a horizontal `stat-grid` of `stat-card`s)
  above the condition band, summarizing the collection. Horizontal here, distinct
  from a detail page's vertical stat rail.
- **row → detail peek** — clicking a row may open a side **sheet**
  quick-detail (overview + a KV subset) instead of navigating away; the full
  detail page stays the deep-link target for the record.

**Actions** — the list surfaces verbs from the shared vocabulary in
[`actions.md`](./actions.md). A **secondary** action (e.g. Export) lives in exactly
**one** place — the summary bar (acting on the current filtered result) **or** the
page header, never both; the header keeps its single primary CTA. The **primary**
verb may legitimately render twice — once in the page header, once in the
*nothing-yet* empty state — but **only** because those two sit far apart (page top
vs. table body). Never duplicate it across a *co-located* pair: a section/card
header and that same section's empty state must not both carry the verb — pick one
(see [`empty-state.md`](../composites/empty-state.md)). A **batch**
action set appears on selection: selecting rows replaces the summary bar's idle
actions with a bulk-action set (selection count + bulk verbs), and destructive
verbs route through a confirm.

## Building blocks

A list page is **assembled from composites** (`../composites/`), each with its
own contract — this pattern only fixes which appear and in what order:

| Anatomy slot | Composite |
|---|---|
| shell (context, **not ported**) | [`app-frame`](../composites/app-frame.md) — the page renders inside `.app-frame__main`, giving it the true content width + scroll root |
| header band (full-bleed) | [`page-header`](../composites/page-header.md) |
| content region (gutters + stack) | [`page-body`](../composites/page-body.md) |
| condition band + applied filters | [`list-filter`](../composites/list-filter.md) family (condition-band · search-input · filter-chip · applied-filters) + the `useListFilters` draft/applied state |
| list card | a [`data-table`](../composites/data-table.md) `table-frame --flush` wrapping the next three |
| summary bar (sticky) | [`summary-bar`](../composites/summary-bar.md) |
| table (sticky header) | [`data-table`](../composites/data-table.md) (sort · selection · row-open · sticky header) |
| pagination (rich footer) | [`pagination`](../composites/pagination.md) — `RichPagination`: rows-per-page + range summary + **numbered** nav (‹ Prev · 1 2 3 … n · Next ›) on the right |
| empty / loading | [`empty-state`](../composites/empty-state.md) · [`skeleton`](../composites/skeleton.md) |

Those composites in turn lean on primitives (`Button`, `Input`, `Badge`,
`Select`, `Card`, `Checkbox`). In `@cloud/ui` they are the `layout/` +
`list-filter/` + `ui/Table` families; an artifact composes the same anatomy from
`composites.css` (on top of `primitives.css` + `release/tokens.inline.css`). Same
parts, same names, both sides.
