# Pagination · composite

Move through pages of a collection, and set page size. Sits at the foot of the
list, inside the same frame as the table.

> **Contract scope.** Cross-consumer contract: anatomy, states, tokens. React
> prop types live with `@cloud/ui`; the contract wins.

## The shape — numbered pages, `‹ Prev · 1 2 3 … n · Next ›`

Pagination is a **numbered** nav: page numbers are jump targets, the current one is
highlighted (`aria-current="page"`), and long ranges collapse with an ellipsis
(first/last/current ± neighbors). An **optional** `« first / last »` quick-jump pair
sits outside Prev/Next for large sets. This is the shape **everywhere** — a standalone
pager AND the table/list footer, where `rich-pagination` puts this nav on the right
beside the rows-per-page select and the range summary (mirrors `@cloud/ui`
`RichPagination`). The one non-numbered shape is **cursor pagination** (Prev/Next only,
no page numbers — you can't random-access an opaque cursor); a narrow-width fallback may
likewise collapse to `Page {page} of {total}` (see *Caption strings*).

## Anatomy

```
┌ pagination ──────────────────────────────────────────────────┐
│ ‹ Prev    1  2  3  …  9    Next ›                              │
└───────────────────────────────────────────────────────────────┘
   with first/last quick-jump:  « ‹ Prev  1  2 … 9  Next › »
   cursor (no total, no jumps):  ‹ Prev              Next ›
```

## Rules

- **Numbered pages are the default.** Page numbers reuse the button recipe (idle
  ghost; current = soft `primary-50`/`primary-700`/600 + `aria-current="page"`) and
  collapse with an ellipsis (`.pagination__ellipsis`, first/last/current ± neighbors).
- **Prev/Next are icon-only (pinned).** Each is a lone chevron glyph
  (`chevron-left` / `chevron-right`) with an `aria-label` (`Previous page` /
  `Next page`) and **no visible text label** — do *not* render the words "Prev"/
  "Next" in the button. In the anatomy and prose above, "Prev"/"Next" name the
  buttons; they are not the rendered content. (The `‹`/`›` in the diagrams *are*
  the chevrons.) They **disable at the ends** (`opacity-50`, `cursor-not-allowed`)
  — they don't disappear, so nothing reflows.
- **First/last quick-jump is optional.** `« / »` (chevrons-with-a-bar,
  `chevrons-left` / `chevrons-right`) jump to page 1 / last and also disable at the
  boundaries. Add them for large sets; omit them for short ranges.
- **Rows-per-page** is a `select`; changing it returns to page 1. It lives in the
  rich footer's left group alongside the range summary.
- **Cursor pagination is Prev/Next only.** For large or unknown totals the data layer
  is opaque-cursor (`CursorPager`) — no page numbers, because you can't jump to an
  arbitrary page. That is the only pager without numbered buttons.

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
- **Current-page display** (`.pagination__current`, weight 500, `aria-current="page"`)
  — used only where there are **no page buttons**: cursor pagination and the
  narrow-width fallback. The React compact fallback shows **`Page {page} of {total}`**;
  a bare cursor pager may show the page number alone. In the default numbered nav the
  current page is a highlighted page **button**, not a separate display.

## The list footer is a separate composite (`rich-pagination`)

This `pagination` is the **nav only**. The full list/table footer — an optional
rows-per-page `select` + the **range summary** ("Showing 1–25 of 1,248") on the
left, this numbered nav on the right — is the **`rich-pagination`** composite, which
*composes* this one (mirrors `@cloud/ui` `RichPagination` wrapping `Pagination`).
See `rich-pagination.md`. It sits at the foot of the list card, inside the
`--flush` table frame, directly below the table. The range-summary string is
pinned above (*Caption strings*) and reused verbatim by `rich-pagination`.

## Implementations

- **Next / @cloud/ui** — `Pagination` renders numbered pages (offset via `Pager`);
  opaque-cursor data uses `CursorPager` + `useCursorPagination` (Prev/Next only — see
  the `request` skill). `RichPagination` is the list footer: rows-per-page `Select` + a
  localized "Showing X–Y of Z" summary (`ui.pagination`) on the left, the numbered nav on
  the right. Callers pass only `page`/`pageCount`/`total`/`pageSize`. `ui` skill →
  data-display. The summary string is the pinned **`Showing X–Y of Z`** (see
  *Caption strings* above).
- **Artifact** — the nav is a `<nav class="pagination">` holding the buttons directly:
  prev `.pagination__page` + `[aria-current="page"]` page buttons + `.pagination__ellipsis`
  for gaps + next `.pagination__page` (add first/last `.pagination__page` chevrons for the
  quick-jump). A cursor / narrow pager instead shows `.pagination__current` (the page-number
  display) between Prev and Next. The full list footer (rows-per-page + range summary +
  this nav) is the separate **`rich-pagination`** composite, which composes this — see
  `rich-pagination.md`. In `composites.css`.
