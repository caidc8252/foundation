# App frame · composite — prototype shell

The portal chrome a page lives inside: a fixed sidebar, a sticky top header, and
the scrolling content region. Mirrors `@cloud/ui` `layout/Layout`.

> **CONTEXT ONLY — do NOT port.** The real app already provides `Layout`; you
> never re-implement it from a prototype. The frame exists so a prototype renders
> its page in the **true box** — content width = `viewport − sidebar`, the real
> sticky `h-14` header, and `main` (not the window) as the scroll root — instead
> of a centered `max-width` column that silently deviates from production. The
> **port boundary is `.app-frame__main`**: everything inside it (the page-header,
> page-body, …) is the page you port; the frame around it is discarded.

## Anatomy

```
┌ app-frame (flex · h-screen · overflow-hidden) ───────────────────────┐
│ ┌ sidebar ─┐ ┌ col (flex-1 · min-w-0) ──────────────────────────────┐│
│ │ brand    │ │ header (h-14 · sticky · surface-2 · border-b)        ││
│ │ nav      │ ├──────────────────────────────────────────────────────┤│
│ │  · item  │ │ main  ← THE scroll root (overflow-y-auto, unpadded)   ││
│ │  · item  │ │   ┌ page-header (full-bleed) ────────────────────┐    ││
│ │  ·[active]│ │   ╞ page-body … the page you actually port ═════╡    ││
│ │          │ │   └───────────────────────────────────────────────┘    ││
│ └──────────┘ └──────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────────┘
   248px (56 collapsed)        content = viewport − sidebar
```

## Rules

- **Mirror `Layout` exactly.** Sidebar `248px` (collapsed `56`), `surface-3`,
  `shrink-0`; header `h-14` (56px), `surface-2`, bottom hairline, sticky; the
  content column is `flex-1 min-w-0`; **`main` is `overflow-y-auto`, full-width
  and UNPADDED** — pages own their padding so full-bleed bands touch the edges.
- **`main` is the scroll root, not the window.** A page's sticky parts
  (summary bar, sticky table header) dock to `main`'s top — exactly as in
  production. Do **not** wrap the table in a bespoke `max-height` scroller; that
  was a workaround for the missing frame.
- **The frame is non-interactive scaffolding.** Faux nav items + an avatar are
  for visual context only; don't wire behavior. Keep it light — it is not a
  re-skin of the real sidebar, just the right *dimensions* around the content.
- **Mobile:** below `md` the sidebar hides (production swaps to a drawer); the
  content goes full-width — so the prototype shows the real narrow-width layout.

## Dimensions

`248 / 56 / 56` mirror `Layout`'s constants (`SIDEBAR_WIDTH`,
`SIDEBAR_WIDTH_COLLAPSED`, header `h-14`) in the consumer's `Layout` component.
They live as `--app-frame-*`
custom properties on `.app-frame` today; the single-source fix is to promote
them to foundation layout tokens and have `Layout` consume them (currently
hardcoded → one duplication to resolve). See the README proposal.

## Implementations

- **Next / @cloud/ui** — `layout/Layout` (`sidebar` / `header` / `children`
  slots) + `Sidebar` + `PortalHeader`. The page is just `Layout`'s `children`;
  the prototype's frame maps onto this and is **not** generated as code.
- **Artifact** — `.app-frame` › `.app-frame__sidebar` (`__brand` / `__nav` /
  `__nav-label` / `__nav-item`[`--active`]) + `.app-frame__col` (`.app-frame__header`
  with `__spacer` / `__avatar`, then `.app-frame__main`). Drop the page inside
  `.app-frame__main`. In `composites.css`.
