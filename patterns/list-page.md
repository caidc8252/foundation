# Pattern · List page

The default archetype for "a collection you browse, filter, and act on" (the most
common portal screen). A pattern is a *named structure*, not an implementation —
both consumers build it from composites; this file fixes the anatomy, the
ordering, and the load-bearing decisions so a prototype and the production page
read as the same screen. Reference implementation: the `@cloud/ui` list-page
example (the style template — see the `ui` skill).

> 📐 **Copyable examples**
> - [`list-page.html`](./list-page.html) — the `simple` variant: full anatomy assembled
>   from composites (shell → header → condition band → list card with sticky summary bar,
>   sticky-head table, rich pagination; empty/loading swap snippets included).
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
┌ ■ page-header (full-bleed) ──────────────────────────────────┐
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
│ │ ─ pagination: rows ▾  showing 1–25 of N     ‹ 1 2 3 › ── │ │
│ └───────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
   ■ required core   ○ optional — included per business need
```

## Required core / optional slots

A list page is a **framework**, not a filled-in screen (governance principle
[#9 — *Patterns are frameworks*](../governance/principles.md#9-patterns-are-frameworks--a-minimal-required-core-everything-else-optional)):
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

The condition band (when present) **scrolls away** — it is non-sticky. What
stays docked at the scroll-root top is the results card's **summary bar** plus
the **table column header** (these belong to the required core, so they dock
whether or not a condition band sits above them):

- The list card is a `table-frame` in its **`--flush`** form (`overflow: clip`,
  not the default `hidden`) — flush still rounds the corners but does **not**
  establish a scroll container, so the sticky summary bar and header dock to the
  page instead of being trapped inside the card.
- The summary bar is sticky; the table uses a sticky header whose top offset is
  the summary bar's height (`LIST_SUMMARY_BAR_HEIGHT = 48 = --space-12`) so the
  two tile flush with no gap or overlap.
- The card adds **no padding** — summary bar, table, and pagination each own
  their own, and butt against the frame edges.

## Rules

- **At most one primary action — never a required one**, top-right in the
  page-header (`Button` variant `primary`, e.g. "New customer") — present when the
  list supports creating a record, omitted for read-only / reference lists. The
  condition band's Search button (when a condition band is present), the
  Advanced filter trigger, and the summary bar's Export are all `secondary`;
  bulk/row actions are `secondary` (destructive `danger`). Advanced is pushed to the far right
  of the toolbar by `condition-band__spacer` — visually separated from the
  primary filter flow, signalling it is the less-common path.
  Icon-only actions are `ghost` / `ghost-danger` only. The Advanced trigger is
  **optional** — omit it when all filter dimensions fit comfortably in the
  toolbar; add it only when extra criteria need a sheet (`advanced-filter` variant).
- **Page-header slots are business-driven** — only the title is required; every
  other slot is included per this list's job (see the
  [`page-header`](../composites/page-header.md) slot table). Most relevant here:
  - *Count* (`page-header__count`): a live total beside the title (e.g. "1,248").
    Omit when the collection size is not meaningful at a glance or is expensive to
    compute. When present it mirrors the summary bar's count and should update
    together.
  - *Secondary action* (`page-header__actions` secondary `Button`): a page-level
    secondary verb (e.g. "Import"). Omit when no such verb exists for this
    collection; the primary CTA stands alone.
- **Search and filters submit on the Search button — not on change** — *when the
  condition band is present* (it is an optional slot — omit it for a list with no
  filtering). Typing in the search field or picking a quick filter only edits a
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
  passive trailing chevron (`content-tertiary`) — **no inline edit / delete**. A
  record's single-row verbs (Edit, Delete, status changes) live on the
  [detail page](./detail-page.md)'s `detail-header` actions, never on the list row;
  the list's only mutation path is **bulk** (selection → summary-bar `batch-action`).
  A side **peek-drawer** is the *optional* alternative to full navigation (see
  optional slots), not a home for row verbs.
- **Inline row actions are opt-in, and always-visible when present.** Add per-row
  verbs to the list only when a specific requirement emphasizes single-row quick ops
  (e.g. a high-throughput triage queue). They render **always-visible** at the row
  end — the [`data-table`](../composites/data-table.md) default (a table action
  column is never hover-hidden) — as **`xs` text buttons** (not the icon-only ghost
  default), composed per
  [`actions.md`](./actions.md): ≤2 verbs → one inline button each — a `secondary`
  **Edit** + a `danger` **Delete** — ≥3 → a single `⋯` menu. Non-destructive verbs are
  `secondary`; **Delete keeps the `danger` variant** and opens a `confirm-danger`
  dialog. All row buttons are size `xs`; every action `stopPropagation`s so it never
  triggers the row's navigate-to-detail.
- **Three text-column shapes**, and nothing else (keeps columns scannable):
  1. **Two-line** — primary `text-sm`/medium/`content-primary` over a subline
     `text-2xs`/`content-tertiary`; may lead with an avatar / initial tile
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
  the same applied-filter chips.
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
- **row → detail peek** — clicking a row may open a side **drawer / sheet**
  quick-detail (overview + a KV subset) instead of navigating away; the full
  detail page stays the deep-link target for the record.

**Actions** — the list surfaces verbs from the shared vocabulary in
[`actions.md`](./actions.md). A **secondary** action (e.g. Export) lives in exactly
**one** place — the summary bar (acting on the current filtered result) **or** the
page header, never both; the header keeps its single primary CTA. A **batch**
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
| pagination (rich footer) | [`pagination`](../composites/pagination.md) — `RichPagination`: rows-per-page + range summary + **simple** prev/next nav (current page only, no jump — the table constraint) |
| empty / loading | [`empty-state`](../composites/empty-state.md) · [`skeleton`](../composites/skeleton.md) |

Those composites in turn lean on primitives (`Button`, `Input`, `Badge`,
`Select`, `Card`, `Checkbox`). In `@cloud/ui` they are the `layout/` +
`list-filter/` + `ui/Table` families; an artifact composes the same anatomy from
`composites.css` (on top of `primitives.css` + `dist/tokens.inline.css`). Same
parts, same names, both sides.
