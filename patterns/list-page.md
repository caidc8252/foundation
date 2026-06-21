# Pattern · List page

The default archetype for "a collection you browse, filter, and act on" (the most
common portal screen). A pattern is a *named structure*, not an implementation —
both consumers build it from primitives; this file fixes the anatomy and the
ordering so a prototype and the production page read as the same screen.

## Anatomy (top → bottom)

```
┌ page-header ─────────────────────────────────────────────┐
│ title + count            [ secondary action ] [ primary ] │
├ condition band ──────────────────────────────────────────┤
│ [ search ] [ quick filters ]            [ advanced ▸ ]    │
├ applied filters ─────────────────────────────────────────┤
│ ⊗ chip   ⊗ chip   ⊗ chip                      clear all   │
├ summary bar ─────────────────────────────────────────────┤
│ N results · sorted by …                      [ density ]  │
├ table ───────────────────────────────────────────────────┤
│ selectable rows · sticky header · row actions on hover    │
├ pagination ──────────────────────────────────────────────┘
│ ‹ prev   1 2 3 …   next ›                  rows per page   │
```

## Rules

- **One primary action**, top-right (`Button` variant `primary`). Bulk/secondary
  actions are `secondary`/`ghost`.
- **Search is debounced**, filters apply immediately; both reflect into applied-filter
  chips so the active query is always visible and removable.
- **Empty, loading, error** are first-class states, not afterthoughts (see the
  `empty` and `skeleton` primitives). Empty state invites the primary action.
- **Selection** drives a bulk-action bar; selected row uses `state-selected` +
  `shadow-row-selected`.
- Container max-width `--container-content`; the table scrolls inside its own
  `overflow-x` region, the page never scrolls horizontally.

## Building blocks

Primitives: `Table`, `Button`, `Input`/search, `Badge` (status), `Checkbox`
(selection), pagination. In `@cloud/ui` these are realized by the `layout/`
(page-header, page-body) and `list-filter/` (search-input, filter-chip,
advanced-filter-sheet, applied-filters, list-summary-bar) families; an artifact
composes the same anatomy from `primitives.css`.

> First-draft stub — expand with concrete token/spacing specs as real list pages land.
