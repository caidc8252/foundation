# Section card · composite

A titled — and optionally **collapsible** — content panel: the block a detail
page is divided into ("Overview", "Billing", "Activity"). It is a thin
composition over two primitives — the [`Card`](../primitives/card.md) surface
(header + content slots) and the [`Collapsible`](../primitives/collapsible.md)
open/close behavior — named here because it is *the* recurring grouping block on
detail and settings screens, the same way `stepper` is named for its
`input-group` composition and `theme-toggle` for its `btn--ghost` recipe.

> **Contract scope.** The cross-consumer design contract: anatomy, the
> collapse behavior, what it reuses, tokens. NOT the React prop types — those
> live with `@cloud/ui` + the `ui` skill. When an implementation disagrees with
> this file, the file wins.

## Anatomy

```
┌ section-card (= Card surface) ───────────────────────────┐
│ Title                              [ action? ]  [ ⌄ ]     │  ← CardHeader (+ chevron when collapsible)
├──────────────────────────────────────────────────────────┤  ← header hairline (hidden when collapsed)
│ CardContent — KV grid · table · form · feed …            │
└──────────────────────────────────────────────────────────┘
```

- **Surface** — the `Card` root (`surface-2`, `line-default`, `radius-xl`,
  `shadow-1`). Section cards rest at elevation 1; do not lift them.
- **Header** — `CardHeader` with a `CardTitle` (`text-md`, weight 600) and an
  optional right-aligned `CardAction`. When collapsible, the whole header is the
  toggle and carries a trailing chevron.
- **Content** — `CardContent`; holds whatever the section is (a `kv-grid`, a
  `data-table` via the header's `flush` slot, a form, a `feed-list`…).

## Rules

- **Reuse, don't re-skin.** The surface, header rule, title type, and slot
  padding are the `Card` primitive's; the open/close is the `Collapsible`
  primitive's. This composite adds only the chevron, its rotation, and the
  collapsed-header rule — nothing the two primitives already own.
- **Collapse is opt-in.** A static section omits the toggle and is just
  `Card` + `CardHeader` + `CardContent`. Add `--collapsible` only when a section
  is genuinely long and secondary.
- **Header hairline follows state** — present when open (separating header from
  content), dropped when collapsed (the header reads as a single closed bar).
- The chevron points down when open, right/up when closed; rotation is the only
  motion (respects reduced-motion via the token duration).

## States

- **open / closed** (`data-open`) — closed hides the content and the header rule;
  the chevron rotates. The skin can't observe live disclosure state, so set
  `data-open` on the root.
- **interactive header** — when collapsible, the header is a real `button`
  spanning the card width, with a hover surface and a focus ring (`shadow-focus`).
- **Loading** — the header holds; `skeleton` rows fill the content.

## Implementation notes

Cross-consumer guards. No non-token measures here (chevron `size-6`, glyph
`size-4`, all spacing tokens) — the risk is **state wiring**:

- **It's `Card` + `Collapsible`** — reuse both primitives; add only the chevron,
  its rotation, and the collapsed rule. Don't re-skin the card surface / header /
  slot padding.
- **Collapsed** (`data-open="false"` / disclosure `data-state="closed"`): hide
  the content, **drop the header's bottom hairline** (so the closed card reads as
  one bar), and rotate the chevron (`-90deg`). Drive all three off the disclosure
  state, not a static class the skin sets by hand.
- The collapsible header is a real `button` spanning the card width (focus ring +
  hover surface) — not a `div` with a click handler.

## Implementations

- **Next / @cloud/ui** — `Card` (`CardHeader` / `CardTitle` / `CardAction` /
  `CardContent`) wrapped in the `Collapsible` primitive for the collapsible
  variant. No new component beyond that composition; see the `ui` skill.
- **Artifact** — reuse `.card` + `.card__header` / `.card__content` from
  `primitives.css`; add `.section-card` on the root, `.section-card--collapsible`,
  `.section-card__toggle` (header-as-button), and `.section-card__chevron`
  (`data-open` rotates it). The collapsed rule lives in `composites.css`.
