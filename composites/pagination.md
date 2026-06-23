# Pagination · composite

Move through pages of a collection, and set page size. Sits at the foot of the
list, inside the same frame as the table.

> **Contract scope.** Cross-consumer contract: anatomy, states, tokens. React
> prop types live with `@cloud/ui`; the contract wins.

## Constraint — tables/lists use the SIMPLE variant

A list/table footer shows **`‹ Prev · current page · Next ›` only** — no numbered
jump targets, no ellipsis. The current page is **displayed, not a jump target**;
the total lives in the range summary ("showing 1–25 of 1,248"), not as page
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

## Rich variant — the list footer (`RichPagination`)

The list pattern's footer: range info on the left, simple nav on the right.

- **Left** — an optional rows-per-page `select` + a **range summary**
  ("showing 1–25 of 1,248"): tabular figures, the numbers `content-primary`
  (bolded), the surrounding words `content-secondary`. Omit the select for
  fixed-page-size lists; the summary stays — it's what carries the total.
- **Right** — the **simple** `‹ Prev · current page · Next ›` nav.

Sits at the foot of the list card, inside the `--flush` table frame, directly
below the table.

## Implementations

- **Next / @cloud/ui** — `Pagination` with `simple` (tables/lists) or numbered
  (non-table, the default). Offset via `Pager`, opaque-cursor via `CursorPager` +
  `useCursorPagination` (see the `request` skill). `RichPagination` is the list
  footer and **always uses `simple`**: rows-per-page `Select` + a localized
  "showing X–Y of Z" summary (`ui.pagination`) on the left, simple nav on the
  right. Callers pass only `page`/`pageCount`/`total`/`pageSize`. `ui` skill →
  data-display.
- **Artifact** — simple nav = `.pagination__pages` › prev `.pagination__page`
  + `.pagination__current` (the page number) + next `.pagination__page`. The
  rich footer = `.pagination` › `.pagination__info` (rows `.select--sm` +
  `.pagination__summary`) on the left + that simple nav on the right. The
  numbered variant (non-table) adds `[aria-current="page"]` page buttons +
  `.pagination__ellipsis`. In `composites.css`.
