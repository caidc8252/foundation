# Tooltip

A short text hint shown on hover/focus of a trigger. A small inverted bubble with a directional arrow, portalled above the page.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> bubble's surface/typography/spacing token recipe, sides, anatomy, a11y. It is
> the authority both implementations answer to. It deliberately does NOT document
> the React prop *types* or base-ui specifics — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Variants

Single visual variant — one inverted bubble. It does NOT carry tone/semantic
variants (no success/warning/error tooltip); status belongs to `Alert`/`Badge`.
The only axis is placement (`side` + `align`), which the positioner owns.

| part | token recipe |
|---|---|
| bubble | bg `content-primary` · text `content-inverse` · radius `radius-md` · padding `cx-sm` inline / `space-1.5` block · font `text-xs` |
| arrow | `size-2.5` (10px) square rotated 45°, `radius-sm` corner · bg `content-primary` (matches bubble) |

(The implementation's `bg-foreground` / `text-background` are shadcn aliases for
the inverted pair — they resolve to `content-primary` bubble fill on a
`content-inverse` text in this token system. `max-w-xs` caps the bubble width so
long hints wrap rather than running off-screen.)

## Sizes

No size variants — one compact bubble. Fixed `text-xs` (12px) type, `cx-sm`
(10px) inline padding, `space-1.5` (6px) block padding. Max width is capped
(`max-w-xs`); the bubble is otherwise content-sized (`w-fit`).

## States

A tooltip is a transient overlay — it has no hover/active/disabled/invalid of its
own (the *trigger* owns those). Its only states are open/closed transitions,
owned by the React implementation:

- **open / delayed-open** — fade + zoom-in entrance (`fade-in` + `zoom-in-95`), plus a short directional slide keyed off `side` (slides up from a `top` placement, etc.).
- **closed** — fade + zoom-out exit.
- transform origin tracks the resolved side (`origin-(--transform-origin)`).

These animations are base-ui behaviors; the reference CSS expresses the static
open skin only (no enter/exit keyframes).

## Anatomy

```
        ┌──────────────────────┐
        │  hint text           │   ← .tooltip (bubble: bg content-primary)
        └───────────▽──────────┘
                    └ .tooltip__arrow (45°-rotated square, matches bubble)
```

`[ content ] [ arrow ]` — the bubble holds the hint text (and optionally an
inline `kbd` shortcut chip, with tightened end padding when present); the arrow
is a rotated square pinned to the bubble edge, positioned per resolved `side`.
The trigger is a separate element (any focusable control) and is NOT part of the
bubble skin.

## Accessibility

- The hint is supplementary — base-ui wires the trigger↔content `aria-describedby` relationship and `role`. Never put essential, action-critical information only in a tooltip.
- Opens on hover AND keyboard focus of the trigger; closes on blur/leave/Escape. Provider-level `delay` controls hover open timing (default `0`).
- Triggers must be real focusable controls (a `<button>`, link, or input) so keyboard users can surface the hint.
- The bubble itself is not focusable and does not trap focus.

## Notes

- The block padding is `space-1.5` (6px) and the arrow is `size-2.5` (10px) — both half-steps. The raw space scale has `--space-1` (4px) and `--space-2` (8px) but no 1.5/2.5; the reference CSS uses `calc()` over those raw steps to hit 6px / 10px rather than inventing a token. No new token is proposed — it is a one-component half-step, not a reusable rhythm.
- Inverted-bubble pair: this is the only primitive that paints on `content-primary` as a *surface*. No dedicated `--bg-tooltip` / `--bg-inverse-surface` token exists; `content-primary` is the correct theme-aware value (it flips with `[data-theme]`, keeping the bubble readable in both modes). If inverted overlays proliferate, propose an `--bg-inverse` surface token then.

## Implementations

- **Next / @cloud/ui** — `import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@cloud/ui"`. base-ui `Tooltip` under the hood; wrap the trigger in `TooltipTrigger`, text in `TooltipContent` (props `side` `sideOffset` `align` `alignOffset`). Open/close, portalling, positioning, and the arrow placement are **behavior owned by the React implementation** — the reference CSS expresses the static bubble skin only. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — use `.tooltip` for the bubble + `.tooltip__arrow` for the pointer, on top of the inlined `dist/tokens.inline.css`. The artifact side renders a *static* open bubble (positioning/show-hide is the React side's job); same inverted recipe (`content-primary` fill, `content-inverse` text).
