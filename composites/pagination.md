# Pagination · composite

Move through pages of a collection, and set page size. Sits at the foot of the
list, inside the same frame as the table.

> **Contract scope.** Cross-consumer contract: anatomy, states, tokens. React
> prop types live with `@cloud/ui`; the contract wins.

## Constraint — tables/lists use the SIMPLE variant

A list/table footer shows **`‹ Prev · current page · Next ›` only** — no numbered
jump targets, no ellipsis. The current page is **displayed, not a jump target**;
the total lives in the range summary ("Showing 1–25 of 1,248"), not as page
buttons. This is a hard rule, enforced in `@cloud/ui` by `RichPagination` always
rendering `Pagination` in `simple` mode. (Numbered jump pagination is a separate,
non-table option — see below.)

## Anatomy

```
┌ pagination · simple (tables / lists) ────────────────────────┐
│ ‹ Prev                3                Next ›                  │
└───────────────────────────────────────────────────────────────┘
   numbered (non-table only): ‹ Prev  1  2  3  …  9  Next ›
```

## Rules

- **Simple is the default for collections.** `‹ Prev | current page | Next ›`.
  The current page is a non-interactive display (`content-primary`, weight 500,
  tabular). Prev/Next reuse the button recipe and **disable at the ends**
  (`opacity-50`, `cursor-not-allowed`) — they don't disappear, so nothing reflows.
- **Rows-per-page** is a `select`; changing it returns to page 1. It lives in the
  rich footer's left group alongside the range summary.
- For large or unknown totals the data layer is **cursor pagination** (Prev /
  Next only) anyway — `CursorPager`; simple mode matches it visually.
- **Numbered variant — non-table contexts only.** Page numbers reuse the button
  recipe (idle ghost; current = soft `primary-50`/`primary-700`/600 +
  `aria-current="page"`) and collapse with an ellipsis (`.pagination__ellipsis`,
  first/last/current ± neighbors). Do **not** use this in a list/table footer.

## Caption strings (pinned — copy verbatim, do not paraphrase)

These user-visible strings are **fixed templates** mirrored from `@cloud/ui`'s
`ui.pagination` messages (the `RichPagination` recipe + `messages/en.json`). Do not
reword, recase, or re-bold them — drift (e.g. `showing` vs `Showing`, or bolding the
whole range instead of just the total) is a cross-screen consistency bug.

- **Range summary** (rich footer, left) — the source message is
  **`Showing {from}–{to} of <b>{total}</b>`**, i.e. **`Showing X–Y of Z`**:
  - Leading word capitalized **`Showing`** (never `showing`), then one space.
  - `X–Y` joined by an **en-dash `–`** (`&ndash;`), no spaces around it.
  - The literal lowercase word **` of `** (single spaces) separates range from total.
  - All figures are **comma-grouped** thousands (`1,248`).
  - **Bolding — ONLY the total.** Wrap just `Z` in `<strong>` (`content-primary`,
    weight 600); `Showing`, the `X–Y` range, and `of` stay `content-secondary`. The
    whole span is `tabular-nums`. Do **not** bold `X` or `Y` (the `<b>` in the message
    encloses only `{total}`).
  - e.g. `Showing 1–25 of `**`1,248`** · `Showing 1,226–1,248 of `**`1,248`**.
- **Current-page display** (simple nav, centre) — **the page number alone**, e.g. `3`
  (`.pagination__current`, weight 500, `aria-current="page"`). Never pair it with the
  total as `1 / 1`; the total lives only in the range summary. (The React compact-width
  fallback shows `Page {page} of {total}` — a separate narrow-mode control, not this
  display.)

## The list footer is a separate composite (`rich-pagination`)

This `pagination` is the **nav only**. The full list/table footer — an optional
rows-per-page `select` + the **range summary** ("Showing 1–25 of 1,248") on the
left, this simple nav on the right — is the **`rich-pagination`** composite, which
*composes* this one (mirrors `@cloud/ui` `RichPagination` wrapping `Pagination`).
See `rich-pagination.md`. It sits at the foot of the list card, inside the
`--flush` table frame, directly below the table. The range-summary string is
pinned above (*Caption strings*) and reused verbatim by `rich-pagination`.

## Implementations

- **Next / @cloud/ui** — `Pagination` with `simple` (tables/lists) or numbered
  (non-table, the default). Offset via `Pager`, opaque-cursor via `CursorPager` +
  `useCursorPagination` (see the `request` skill). `RichPagination` is the list
  footer and **always uses `simple`**: rows-per-page `Select` + a localized
  "Showing X–Y of Z" summary (`ui.pagination`) on the left, simple nav on the
  right. Callers pass only `page`/`pageCount`/`total`/`pageSize`. `ui` skill →
  data-display. The summary string is the pinned **`Showing X–Y of Z`** (see
  *Caption strings* above).
- **Artifact** — the nav is a `<nav class="pagination">` holding the buttons
  directly: simple nav = prev `.pagination__page` + `.pagination__current` (the
  page-number display) + next `.pagination__page`. The numbered variant (non-table)
  holds `[aria-current="page"]` page buttons + `.pagination__ellipsis`. The full
  list footer (rows-per-page + range summary + this nav) is the separate
  **`rich-pagination`** composite, which composes this — see `rich-pagination.md`.
  In `composites.css`.
