# Rich Pagination · composite

Full list/table footer bar: optional rows-per-page selector + "Showing X–Y of Z" range summary on the left, page-number navigation on the right. Composes `.pagination` (right) with a rows/summary cluster (left). All visible text is i18n — the host supplies translated strings.

> **Prefer this over bare `.pagination`** at the bottom of any list or table that supports variable page sizes. Use bare `.pagination` only for simple paged views with a fixed page size.

## Variants

No variant axis — one bar shape. The rows-per-page selector is optional: omit it to show only the range summary + navigation (e.g. lists with a fixed page size).

## States

Inherits from `.pagination` (page buttons, disabled first/last). The rows-per-page selector inherits `.select` states.

## Sizes

No size prop — height follows the inner controls (`spacing-control-md`, 36px).

## Anatomy

```
┌ rich-pagination ───────────────────────────────────────────────────────────┐
│ ┌ rich-pagination__left ─────────────────────┐  ┌ pagination ─────────── ┐│
│ │ [10 ▾] rows    Showing 1–10 of 247        │  │ ‹ 1 2 3 … 25 ›         ││
│ └────────────────────────────────────────────┘  └────────────────────────┘│
└────────────────────────────────────────────────────────────────────────────┘
```

- **`.rich-pagination`** — flex row, `justify-content: space-between`, `align-items: center`, `gap: space-4`, `padding-inline: space-2`.
- **`.rich-pagination__left`** — left cluster; flex row, `gap: space-3`.
  - **`.rich-pagination__rows`** — rows-per-page row: label text + `.select` control; flex row, `gap: space-2`, `text-md`, `content-secondary`.
  - **`.rich-pagination__summary`** — the pinned range string **`Showing X–Y of Z`** (copy verbatim — see *Caption string* below); `text-md`, `content-secondary`, `white-space: nowrap`.
- Right slot — `.pagination` (from `composites/composites.css`); composed, not a child class.

## Caption string (pinned — copy verbatim, do not paraphrase)

The range summary is the **fixed template `Showing X–Y of Z`**, mirrored from
`@cloud/ui`'s message `Showing {from}–{to} of <b>{total}</b>` — the same string the
`pagination` contract pins (see `pagination.md` → *Caption strings* for the full rule).
In short: capitalized `Showing`, an en-dash `–` (`&ndash;`) in `X–Y` with no surrounding
spaces, the lowercase word ` of `, comma-grouped thousands, the whole span `tabular-nums`,
and — matching the `<b>` in the message — **only the total wrapped in `<strong>`**
(`content-primary`, weight 600); `Showing`, the `X–Y` range, and `of` stay
`content-secondary`. Do **not** bold `X` or `Y`. The navigation's current page is shown
as the bare page number — never paired with the total as `X / Y`.

## Accessibility

- The rows-per-page `<select>` needs an associated `<label>` (visually-hidden is fine; use the translated "rows per page" string as the accessible name).
- The range summary is a live region in the React implementation (`aria-live="polite"` on the host); the artifact reference omits this — it's a React behavior.
- Navigation a11y is inherited from `.pagination`.

## Notes

- The rows-per-page selector maps to a native `<select class="select select--sm">` in the artifact reference.
- Page-size options default to `[10, 25, 50, 100]` in the React implementation; artifact authors supply their own `<option>` elements.

## Implementations

- **Next / @cloud/ui** — `import { RichPagination } from "@cloud/ui"`. Props: `page` `pageCount` `onPageChange` `total` `pageSize` `onPageSizeChange?` `pageSizeOptions?` `siblingCount?` `showFirstLast?` `className`. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — `.rich-pagination` containing `.rich-pagination__left` (→ `.rich-pagination__rows` + `.rich-pagination__summary`) and a separate `.pagination` block. In `release/composites.css` on top of `release/tokens.inline.css` + `primitives/primitives.css`.
