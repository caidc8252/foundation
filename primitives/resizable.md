# Resizable

A draggable split-pane layout: sibling panels separated by a hairline handle the user drags to redistribute space. Use for app shells with adjustable sidebars/editors, not for general content layout.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> handle/panel anatomy, the token recipe, states, a11y. It is the authority both
> implementations answer to. It deliberately does NOT document the React prop
> *types* or the `react-resizable-panels` mechanics — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Parts

Three pieces; only the handle has a paintable skin. The panel group and panels are pure layout (flex container + flex children), no chrome of their own.

| part | role | token recipe |
|---|---|---|
| `PanelGroup` | flex container holding panels + handles; row by default, column when vertical | layout only — `flex`, fills `100%` w/h; no surface/border |
| `Panel` | a single resizable region | layout only — its content owns any surface/padding |
| `ResizableHandle` | the draggable divider between two panels | track `1px` · bg `line-subtle` · hover bg `line-default` · widened invisible hit area via `::after` |

## Orientation

Drives the handle's long axis and its hit-area orientation. Resolved by the group's `data-orientation` / `aria-orientation`.

| orientation | handle track | hit area (`::after`) |
|---|---|---|
| `vertical` divider *(default, group is a row)* | `1px` wide, full height | centered vertical strip, `4px` wide |
| `horizontal` divider (group is a column) | `1px` tall, full width | centered horizontal strip, `4px` tall |

(In `react-resizable-panels` a *horizontal* handle separates *stacked* panels: the group flips to `flex-direction: column` and the handle becomes a full-width bar. The grip rotates 90° to follow.)

## States

- **idle** — track is a near-invisible `line-subtle` hairline.
- **hover** — track darkens to `line-default`. The invisible `::after` hit strip is wider than the visible line, so the hover target is forgiving without thickening the rule.
- **focus-visible** — `1px` ring in `line-focus` (`focus-visible:ring-1`); the source uses a ring, not the standard `shadow-focus` — see Notes.
- **dragging** — visual is owned by the React impl (cursor + live panel resize); no distinct skin token.

## Anatomy

```
PanelGroup (row)
┌──────────┬─┬──────────┐
│  Panel   │H│  Panel   │   H = ResizableHandle
│          │ │          │       · 1px track (the visible rule)
│          │▌│          │       · ::after = invisible 4px hit strip, centered
│          │ │          │       · optional grip nub (withHandle)
└──────────┴─┴──────────┘
```

- **Track** — the `1px` (vertical) / `1px`-tall (horizontal) painted rule.
- **Hit strip** (`__after`, the `::after` element) — invisible, `4px` thick, centered over the track so the drag target is larger than the rule.
- **Grip** (`__grip`, opt-in `withHandle`) — a small centered nub for an explicit drag affordance: `24px × 8px` (`h-6 w-2`), `radius-sm`, fill `line-strong`. Rotates 90° when the handle is horizontal so the nub stays perpendicular to the drag axis.

## Accessibility

- The handle exposes a `separator` role with `aria-orientation` and is keyboard-operable (arrow keys nudge the split) — all owned by `react-resizable-panels`.
- Focus is always visible: the handle takes a focus-visible ring; never remove it.
- The grip nub is decorative — the whole handle is the control, not the nub.

## Notes

- **Behavior owned by the React implementation.** Drag/resize math, min/max/collapse, persisted layout, keyboard nudging, and the `data-orientation` flip all live in `react-resizable-panels` via `@cloud/ui`. The reference CSS expresses the **static handle skin only** (track, hit strip, grip, hover/focus). The artifact side cannot drag.
- **Focus ring divergence.** The source uses `focus-visible:ring-1 ring-line-focus`, not the system's `shadow-focus` token. The reference CSS mirrors the source intent with a `1px` `line-focus` outline (token-sourced) rather than substituting `shadow-focus`, to stay faithful to the thin-rule treatment a divider warrants. If the team wants dividers to share the global focus ring, that is a contract change, not an implementation fix.
- The grip's `8px` width maps cleanly to `--space-2`; its `24px` height to `--space-6`. Both are exact token hits, no half-step calc needed.

## Implementations

- **Next / @cloud/ui** — `import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@cloud/ui"`. `react-resizable-panels` under the hood; pass `direction` to the group, `withHandle` to the handle for the grip nub. Prop/API details: the `ui` skill. Do not re-skin the handle via `className`; the track/hover/grip recipe is fixed here.
- **Artifact (self-contained HTML)** — compose `.resizable-group` (add `.resizable-group--vertical` for stacked panels) with `.resizable-panel` children and `.resizable-handle` dividers, on top of the inlined `release/tokens.inline.css`. Add `.resizable-handle--horizontal` when the divider runs horizontally, and drop a `.resizable-handle__grip` child for the nub. Static only — no drag.
