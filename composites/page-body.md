# Page body · composite

The content region of a screen — everything **beneath** the full-bleed
page-header band. A vertical stack with the page's standard gutters and rhythm,
into which a pattern drops its composites (condition band, list card, form
sections, …). Recurs in **every** pattern (list / detail / create), which is
why it is a shared composite, not re-declared per pattern.

## Anatomy

```
┌ page-header (full-bleed · OUTSIDE page-body) ────────────────┐
│ Title                                    [ secondary ][ prim ]│
╞ page-body · px-6 · pt-6 pb-8 · stack gap-6 ══════════════════╡
│  ┌ condition band ───────────────────────────────────────┐  │
│  └────────────────────────────────────────────────────────┘ │
│  ┌ list card  (summary bar · table · pagination) ────────┐  │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

## Rules

- **The page-header band is full-bleed and lives OUTSIDE page-body** — it draws
  its own bottom hairline edge-to-edge. page-body holds everything below it.
- **One vertical rhythm** — direct children stack with a `space-6` (24px) gap;
  no child adds its own top/bottom margin to compensate. A **tab panel** docked in
  page-body carries this *same* rhythm — it is navigation, not a level of nesting,
  so the active panel stacks its sections at `space-6` too (provided by the panel,
  `.page-body > .tabs__content`; never a hand-rolled `.stack--N` wrapper). Block
  groups genuinely nested *deeper* — sub-sections inside a card, a hand-authored
  sub-group of cards — take their own tighter rung from the spacing ladder
  (principles §13) via `.stack--N`; never a 0-gap fallback.
- **Page gutters** — `space-6` inline padding, `space-6` top, `space-8` bottom
  (a little extra at the foot so the last card doesn't kiss the viewport edge).
- **Width is the shell's job, not page-body's** — centering to
  `--container-content` happens on the app shell around it. page-body owns only
  rhythm + gutters, so it composes the same in a full-width or a centered shell.

## Implementations

- **Next / @cloud/ui** — `layout/PageBody` (`flex flex-col gap-6 px-6 pt-6 pb-8`).
  The exported `PAGE_BODY_PADDING_CLASS_NAME` lets a page opt into the gutters
  without the stack (e.g. a page that manages its own vertical layout). `ui`
  skill → layout.
- **Artifact** — `.page-body` (the stack + gutters). Put the `.page-header`
  before it (full-bleed), then drop composites in as direct children. In
  `composites.css`.
