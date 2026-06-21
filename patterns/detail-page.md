# Pattern · Detail page

"One record, read-mostly, with actions." The archetype you reach a list page's
row into. Named structure, not implementation.

## Anatomy

```
┌ breadcrumbs ─────────────────────────────────────────────┐
├ page-header ─────────────────────────────────────────────┤
│ name + status chip(s)        [ edit ] [ ⋯ ] [ primary ]   │
├ overview (KV grid) ──────────────────────────────────────┤
│ label   value     label   value     label   value        │
│ (grid-auto-fit-kv — columns follow container width)       │
├ section / tabs ──────────────────────────────────────────┤
│ Activity · Related · Settings …                           │
└──────────────────────────────────────────────────────────┘
```

## Rules

- **Status is shown, not editable here** — status changes are explicit actions
  (buttons / menu), each confirmed. Render multi-axis status as separate chips.
- **Tabs vs sections** — use tabs only when sub-views are genuinely independent
  and each is substantial; otherwise stack labelled sections on one page. A detail
  screen is ONE page with tab state, not one route per tab.
- **Overview is a key-value grid** via `grid-auto-fit-kv` (no hand-written
  `repeat(auto-fit,…)`); labels `text-content-tertiary`, values `content-primary`.
- **Destructive actions** live behind the overflow menu or a `danger` button, never
  as a bare primary.
- Sensitive fields render masked by default; reveal is an audited action.

## Building blocks

Primitives: `Card`, `Badge`, `Tabs`, `Button`, `Separator`, `Timeline` (activity),
`Avatar`. `@cloud/ui`: `layout/` content-header + page-body; an artifact composes
the same from `primitives.css` + the KV grid.

> First-draft stub — expand with concrete specs as real detail pages land.
