# List filter family · composite

The "quick bar + applied chips" filtering apparatus of a list page. One family
(shared copy, shared behavior) made of small parts — mirrors @cloud/ui's
`list-filter/` folder.

> **Contract scope.** Cross-consumer contract for the family's anatomy + rules.
> React prop types live with `@cloud/ui` + the `ui` skill; the contract wins.

## Parts

| part | what it is |
|---|---|
| **condition-band** | the shell: a toolbar row stacked over the applied-filter row |
| **search-input** | quick-bar text search, leading magnifier, fixed max width, Enter triggers |
| **filter-chip** | one active, removable filter (label + ✕) |
| **applied-filters** | the row of chips + a "clear all"; renders nothing when empty |

(Advanced/secondary filters open a sheet from a trigger pushed to the toolbar's
right edge — `condition-band__spacer`.)

## Anatomy

```
┌ condition-band ──────────────────────────────────────────────┐
│ [🔍 search        ]  [ quick filter ▾ ]          [ Advanced ▸ ]│  toolbar
│ Filters:  ⊗ Status: Active   ⊗ Region: APAC        clear all   │  applied (or absent)
└───────────────────────────────────────────────────────────────┘
```

## Rules

- **Search is debounced; filters apply immediately.** Both reflect into
  applied-filter chips, so the active query is always **visible and removable**.
- **Applied-filters reserves no space when empty** — it renders null, not an empty
  bar. The label is `text-xs` / `content-tertiary`; "clear all" is a `ghost` `xs`
  button.
- A **chip** is tonal primary (`primary-50` bg, `primary-700` text, hairline
  `primary-500/25` border), pill-shaped, `control-xs` tall; its ✕ is a tiny ghost
  hit-target, not a glyph in text.
- **Search field width is bounded** (`max-inline-size: 16rem`) so the toolbar
  doesn't become one giant input; it `flex:1` up to that cap.
- One canonical order in the toolbar: search → quick filters → (spacer) → advanced.

## Implementations

- **Next / @cloud/ui** — `list-filter/`: `ListConditionBand` (`toolbar` + `applied`
  slots), `SearchInput`, `FilterChip`, `AppliedFilters`, `AdvancedFilterButton` +
  `AdvancedFilterSheet`. Copy via the `ui.listFilter` i18n namespace; pair with the
  `useListFilters` hook. `ui` skill.
- **Artifact** — `.condition-band` › `.condition-band__toolbar` (holding
  `.search-input` › `.search-input__icon` + `.input`, plus `.select`/`.btn`, and
  `.condition-band__spacer` before the advanced `.btn`) + `.applied-filters`
  (`.applied-filters__label` + `.filter-chip`s + a `.btn--ghost.btn--xs`). In
  `composites.css`.
