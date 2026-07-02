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
| **search-input** | quick-bar text search: a `.search-input` wrapping a `.search-input__icon` (leading magnifier — **wrap the `<svg>`, never drop it bare into `.search-input`**) + the `.input` field. Fixed max width, Enter triggers |
| **search button** | `btn--secondary` that commits the draft. Carries a **leading magnifier** (`data-lucide="search"`) — the SAME glyph as the search-input icon, **never a funnel**. The funnel (`data-lucide="funnel"`) belongs to the **Advanced** trigger only; reusing it here makes "submit search" read as "open advanced filters" |
| **filter-chip** | one active, removable filter: label + a `.filter-chip__remove` ghost button whose glyph is the **Cancel** icon `data-lucide="x"` (per `primitives/icon.md` — removing a chip = cancel that filter). Not `trash-2`/`ban`/`circle-x` |
| **applied-filters** | the row of chips + a "clear all"; renders nothing when empty |

(Advanced/secondary filters open a sheet from a trigger pushed to the toolbar's
right edge — `condition-band__spacer`.)

## Anatomy

```
┌ condition-band ──────────────────────────────────────────────┐
│ [🔍 search        ]  [ quick filter ▾ ]  [🔍 Search]  ▽ Advanced│  toolbar
│ Filters:  ⊗ Status: Active   ⊗ Region: APAC  clear all        │  applied (or absent)
└───────────────────────────────────────────────────────────────┘
```

### Search-input — exact structure (copy this; don't hand-roll)

The leading magnifier is a **wrapped** element (`.search-input__icon`), never a bare
`<svg>` dropped into `.search-input` — a bare svg renders unsized and floods the bar.
Artifact markup:

```html
<div class="search-input">
  <span class="search-input__icon">
    <svg data-lucide="search" viewBox="0 0 24 24" …></svg>
  </span>
  <input class="input" type="search" placeholder="Search…">
</div>
```

## Rules

- **Search + filters submit on the Search button — not on change.** This is the
  global design law (**principle 14**), and it holds **wherever this family is
  embedded** — a table under a **detail-page tab**, a picker, any filtered collection —
  not only on a list page. Typing in the
  search field or picking a quick filter only edits a **draft**; nothing runs until
  the user clicks **Search** (Enter in the field also submits), which commits the
  whole draft and resets to page 1. Removing a chip (✕) or **clear all** acts on the
  already-applied query and **re-runs immediately** (no Search click). Every applied
  criterion still shows as a removable chip, so the active query is always **visible**.
  **Search-on-change / search-as-you-type / filter-on-select is a defect.**
- **Applied-filters reserves no space when empty** — it renders null, not an empty
  bar. The label is `text-xs` / `content-tertiary`; "clear all" is a `ghost` `xs`
  button.
- A **chip** is tonal primary (`primary-50` bg, `primary-700` text, hairline
  `primary-500/25` border), pill-shaped, `control-xs` tall; its ✕ is a tiny ghost
  hit-target, not a glyph in text.
- **Search field width is bounded** (`max-inline-size: 16rem`) so the toolbar
  doesn't become one giant input; it `flex:1` up to that cap.
- One canonical order in the toolbar: search input → quick filters → **Search button** → (spacer) → Advanced. The Search button sits with the filters it submits, not at the far end. Advanced is `secondary` and pushed right by the spacer — the spatial separation signals it is the less-common path without changing its visual weight.

## Implementations

- **Next / @cloud/ui** — `list-filter/`: `ListConditionBand` (`toolbar` + `applied`
  slots), `SearchInput`, `FilterChip`, `AppliedFilters`, `AdvancedFilterButton` +
  `AdvancedFilterSheet`. Copy via the `ui.listFilter` i18n namespace; pair with the
  `useListFilters` hook. `ui` skill.
- **Artifact** — `.condition-band` › `.condition-band__toolbar` (holding
  `.search-input` (› `.search-input__icon` + `.input`), `.select` quick-filters, `btn--secondary` Search button, then
  `.condition-band__spacer`, then the Advanced `btn--secondary`) + `.applied-filters`
  (`.applied-filters__label` + `.filter-chip`s + a `.btn--ghost.btn--xs` clear-all
  that **flows inline after the chips**, not pushed right). In `composites.css`.
