# Drawer

An edge-docked panel that slides in from a viewport edge over a dimmed scrim. The mobile-friendly counterpart to the centered Modal — same overlay-and-panel shape, but docked to bottom (default), top, left, or right, draggable to dismiss.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> direction vocabulary, the token recipe, states, anatomy, a11y. It is the
> authority both implementations answer to. It deliberately does NOT document
> the React prop *types* or the `vaul` drag/snap specifics — those live with the
> Next implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Variants

The single variant axis is **direction** — which edge the panel docks to. It drives the inset, the size axis (height vs width), which corners round, and which edge gets the border.

| direction | use | token recipe |
|---|---|---|
| `bottom` *(default)* | mobile bottom-sheet; the canonical use | docked bottom, full-width · `max-height: 80vh` · top gap `space-24` (96px) · round top `radius-xl` · top border `line-default` · shows the drag handle |
| `top` | notification / command sheet from the top | docked top, full-width · `max-height: 80vh` · bottom gap `space-24` · round bottom `radius-xl` · bottom border `line-default` |
| `left` | nav / filter side panel (LTR start edge) | docked left, full-height · `width: min(560px, 90vw)` · round right `radius-xl` · right border `line-default` |
| `right` | detail / inspector side panel (LTR end edge) | docked right, full-height · `width: min(560px, 90vw)` · round left `radius-xl` · left border `line-default` |

All four share the panel surface recipe: bg `surface-2` · text `content-primary` · `text-sm` · `shadow-1`.

## Sizes

No discrete size tokens. The docked axis is fixed and the cross axis is content-driven (`height: auto`, `flex-direction: column`):

- **bottom / top** — span the full inline axis; height grows with content, capped at `80vh`, with a `space-24` (96px) breathing gap on the far edge so the scrim still shows.
- **left / right** — span the full block axis (`inset-y-0`); width is `min(560px, 90vw)` — capped at a readable 560px, shrinking to 90vw on narrow viewports.

(`80vh` / `90vw` are viewport math, and the `560px` readable cap is conventionally exempt — no token expresses them.)

## States

- **open / closed** — vaul drives the slide-in/out (translate from the docked edge) and the overlay fade. The reference CSS paints the resting OPEN state only.
- **drag-dismiss** — bottom/top sheets are draggable toward their edge to close; the drag handle signals this affordance. Drag tracking, snap points, and the dismiss threshold are owned by `vaul`.
- **scrim** — a `black/10` wash (see notes) with an optional `backdrop-blur` where supported; fades in/out with the panel.

The panel itself has no hover/focus/disabled/invalid states — interactive states live on the controls *inside* it (`.btn`, `.input`, the close affordance).

## Anatomy

```
┌ overlay (dimmed scrim, covers viewport) ──────────────┐
│                                                        │
│   ┌ drawer (docked panel) ──────────────────────────┐ │
│   │            ▭  ← handle (bottom direction only)   │ │
│   │ ┌ header ──────────────────────────────────────┐ │ │
│   │ │  title (text-md / 600)                        │ │ │
│   │ │  description (text-sm / content-secondary)    │ │ │
│   │ └───────────────────────────────────────────────┘ │ │
│   │   …body content (consumer-owned)…                │ │
│   │ ┌ footer (pinned to bottom via mt-auto) ───────┐ │ │
│   │ │                       [ Cancel ] [ Confirm ] │ │ │
│   │ └───────────────────────────────────────────────┘ │ │
│   └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

- **overlay** — fixed full-viewport scrim behind the panel.
- **drawer** — the docked panel; `flex-direction: column`.
- **handle** — a small rounded grab bar, centered near the top. Shown **only** for the `bottom` direction (the drag affordance); hidden for top/left/right.
- **header** — title + description stack. Center-aligned for bottom/top sheets, start-aligned (left) at `md+` breakpoint and for the side directions.
- **footer** — action shelf, pushed to the panel bottom via `margin-top: auto`; stacks its children in a column with `space-2` gaps. Holds `.btn` actions.
- **title** — `text-md` / 600 / `content-primary`.
- **description** — `text-sm` / `content-secondary`.

Unlike Modal, the Drawer has no built-in close-button slot or header hairline — dismissal is via drag, scrim tap, or a consumer-placed close control.

## Accessibility

- Dialog semantics, focus trap, scroll lock, Escape/scrim-tap dismissal, and the `aria` wiring of title/description to the panel are owned by `vaul` (the React implementation).
- Provide an accessible name: render the title slot, or supply `aria-label` when the title is visually hidden.
- The drag handle is decorative; keyboard/AT users dismiss via Escape or a focusable close control — never gate dismissal on the drag gesture alone.

## Implementations

- **Next / @cloud/ui** — `import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription, DrawerClose, DrawerOverlay, DrawerPortal } from "@cloud/ui"`. **Behavior owned by the `vaul` React implementation** (open/close, edge slide, drag-to-dismiss, snap points, focus trap, portalling); pass `direction` for the docked edge. Prop/API details: the `ui` skill. Do not re-skin via `className`; the reference CSS expresses the static skin only.
- **Artifact (self-contained HTML)** — use `.drawer-overlay` wrapping `.drawer` (+ `.drawer--bottom` / `--top` / `--left` / `--right`) with `.drawer__handle` (bottom only), `.drawer__header` › `.drawer__title` + `.drawer__description`, and `.drawer__footer` (holding `.btn` actions), on top of the inlined `release/tokens.inline.css`. The reference CSS paints the resting OPEN panel; the consumer drives visibility and the slide is out of scope. Same surface recipe and direction vocabulary as the source.

## Notes

- **Scrim color is a non-token.** The source overlay is `bg-black/10` — a literal black-at-10% wash, not the `surface-overlay` token the Modal uses. The reference CSS keeps fidelity with `color-mix(in oklch, var(--color-content-primary) 10%, transparent)` (theme-aware near-black) rather than hardcoding `rgba`. *Token-change wish:* a dedicated `--color-scrim-light` (or aligning Drawer onto `surface-overlay`) would remove this near-token.
- **`backdrop-blur-xs`** on the overlay is a `supports`-gated progressive enhancement with no blur-radius token; expressed with a small literal `blur()` radius (visual-only, degrades gracefully).
- **The `80vh` cap and `75%` width** are viewport math, conventionally exempt — no sizing token expresses popup dimensions yet (same gap noted across Modal/Dropdown/Command).
- The header's `gap-0.5` (2px) and `py-3.5` (14px) land on half-steps over the raw `--space` scale; expressed via the same `calc()` half-step convention used elsewhere in this stylesheet.
