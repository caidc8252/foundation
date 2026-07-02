# Hover Card

A rich popover that opens on hover (and keyboard focus) over a trigger — for preview cards and detail popovers. Heavier than a tooltip: it holds laid-out content (avatar, title, body, links), not a one-line hint.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> surface recipe, sizing, states, anatomy, a11y. It is the authority both
> implementations answer to. It deliberately does NOT document the React prop
> *types* or base-ui (`PreviewCard`) specifics — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Variants

Single visual variant — a portalled popup surface. No tone/style modifiers; it is a neutral content container the consumer fills.

| part | token recipe |
|---|---|
| popup | width fixed `280px` · radius `radius-xl` · bg `surface-2` · 1px border `line-default` · padding `spacing-cx-md` (14px) · text `content-primary` at `text-sm` · `shadow-4` |

## Sizes

No size variants — the popup is a fixed `280px` wide content box. Height is content-driven. Type baseline is `text-sm`; nested content sets its own scale.

## States

- **open / closed** — the only meaningful state. Open fades + zooms in (95→100%) with a short directional slide from the resolved side; closed reverses. Motion uses `duration-fast`. Both transitions are owned by the React/base-ui impl; the static skin paints the OPEN popup only.
- **placement** — `side` (default `bottom`) and `align` (default `center`) resolve at runtime; the popup's `transform-origin` follows the resolved side. No per-side skin difference beyond the entry slide direction.
- No hover/active/disabled/invalid on the popup itself — it is non-interactive chrome; interactivity lives in the content the consumer places inside.

## Anatomy

```
Trigger (hover/focus target — inline, unstyled by this primitive)
  └─ Portal
       └─ Positioner   (side/align/offset; z above page; transform-origin)
            └─ Popup    ← the surface this contract skins
                 └─ [ consumer content: avatar · title · body · links … ]
```

The trigger is whatever element the consumer wraps; this primitive adds no skin to it. The popup is the only painted surface. Default offsets: `sideOffset` 4px, `alignOffset` 4px.

## Accessibility

- Hover-intent open/close, focus-triggered open, dismiss, and focus management are owned by base-ui `PreviewCard` — not re-specified here.
- Content is supplementary preview detail; it must not be the only path to information (hover is not available to all input modes — focus opens it too, but don't hide essential actions inside).
- The popup is portalled and layered above page content; the consumer is responsible for the semantics of whatever interactive content they nest.

## Notes

- The source uses `rounded-xl` → `radius-xl` (12px) and `shadow-4`, a heavier elevation than the tooltip (which has no token shadow) — the hover card reads as a floating panel, the tooltip as a hint.
- Padding `p-3.5` (14px) has no `--space-*` step; it maps exactly to `--spacing-cx-md` (14px), used here as the popup inset.
- The `280px` fixed width has no token; recorded as a token-change wish (a `--popup-width-sm`-style sizing token would let prototype and production share the value). The reference CSS hardcodes `280px` only because no token expresses it; if one is added, swap it in.
- Open/close keyframes (`fade`, `zoom-95`, directional `slide`) are React/base-ui behavior; the static skin omits animation and renders the resting open surface.

## Implementations

- **Next / @cloud/ui** — `import { HoverCard, HoverCardTrigger, HoverCardContent } from "@cloud/ui"`. base-ui `PreviewCard` under the hood (`Root` / `Trigger` / `Portal` + `Positioner` + `Popup`). `HoverCardContent` takes `side` `sideOffset` `align` `alignOffset` (defaults bottom / 4 / center / 4). Behavior — hover-intent timing, portalling, side resolution, enter/exit animation — is owned by the React implementation; API details: the `ui` skill.
- **Artifact (self-contained HTML)** — use `.hover-card` for the popup surface (positioned by the consumer's own layout/JS), on top of the inlined `release/tokens.inline.css`. The reference CSS expresses the static skin only (surface, border, radius, shadow, padding, type); open/close and positioning are not reproduced.
