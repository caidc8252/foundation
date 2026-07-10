# Spinner

A circular, indeterminate loading indicator — a spinning ring shown while content or an action is in flight (in-button `loading`, inline "fetching", small section busy state). For known-shape page/section/table loads prefer a Skeleton; reserve the Spinner for unknown-duration, unknown-shape waits.

## Variants

Single visual variant — a circular ring (`rounded-full`) drawn as a 2px border where three edges read as the neutral track and the top edge reads as the accent, then spun. State is not a variant: the spinner is always indeterminate. The only knob is `size`.

| part | token recipe |
|---|---|
| track (full ring) | 2px border `line-default` |
| head (top edge) | top border `primary-700` (the impl's `border-t-primary` alias) |
| shape | `radius-full` |
| motion | continuous `rotate` 0→360°, `ease` linear, period 750ms |

## Sizes

| size | diameter | token | use |
|---|---|---|---|
| `sm` | 14px | — *(no 14px size token; see notes)* | inline beside text, dense rows |
| `md` *(default)* | 16px | `--space-4` | standard inline / in-button replacing the left icon |
| `lg` | 20px | `--space-5` | small indeterminate section / overlay busy state (not a known-shape card — that uses a Skeleton) |
| `xl` | 32px | `--space-8` | full-panel / empty-area load of unknown shape |

Border stays 2px across all sizes (a 1px-hairline-exempt value does not apply — the 2px ring weight is intrinsic to the glyph, not a hairline; it is the one fixed stroke and carries through every size).

## States

The spinner has no interactive states — no hover / active / focus / disabled / invalid. It is a non-interactive status glyph; it animates whenever mounted. Under `prefers-reduced-motion` the animation should stop (the reference CSS guards this; the `--duration-*` tokens already zero under reduced motion, but the spin period here is hardcoded, so the reference CSS adds an explicit reduced-motion guard).

## Anatomy

A single circular element — no children, no label slot. The visible ring is its own border: all four edges use the neutral track color except the top edge, which uses the accent; rotating the element makes the accent arc chase around the circle, reading as a spinning head. There is no separate track + head DOM; one bordered circle does both.

```
   ╭───╮      top edge  = primary-700 (the "head")
  (  ⟳  )     other 3   = line-default (the "track")
   ╰───╯      whole ring spins 360° every 750ms
```

## Accessibility

- Renders with `role="status"` and `aria-label="Loading"` baked in — assistive tech announces it as a live busy indicator without extra wiring.
- Purely decorative motion; no keyboard interaction, not focusable.
- Respect `prefers-reduced-motion`: stop the rotation (the glyph still reads as "busy" from the `role="status"` semantics even when static).
- When used inside a Button's `loading` state, the button owns the disabled/`aria` semantics; the spinner is just the visual.

## Notes

- **`border-t-primary` alias.** The source draws the head with the `primary` / `border-t-primary` semantic alias; in this token system that resolves to `--color-primary-700` (the default CTA color). The reference CSS uses `--color-primary-700` directly.
- **750ms spin period is not a token.** The source pins `animationDuration: "750ms"` inline — there is no `--duration-*` token at 750ms (nearest is `--duration-slow` 320ms). *Token-change wish:* add a `--duration-spin` (≈750ms) motion token so the spin speed is governed, not hardcoded. The reference CSS hardcodes `750ms` to stay faithful to the glyph's perceived speed and flags it here; this is the single value in this contract not sourced from a token.
- **14px (`sm`) has no size token.** The space scale jumps `--space-3` (12px) → `--space-4` (16px); there is no 14px step. *Token-change wish:* a `--space-3.5` (14px) step. The reference CSS hardcodes `14px` for `sm` and notes it inline rather than collapsing `sm` into `md`.

## Implementations

- **Next / @cloud/ui** — `import { Spinner } from "@cloud/ui"`. Plain `<div role="status">` (no base-ui); props `size` (`sm` | `md` | `lg` | `xl`, default `md`) plus pass-through `div` props / `className`. The animation (continuous rotate, 750ms) is owned by the implementation/CSS, not configurable per the contract.
- **Artifact (self-contained HTML)** — use `<div class="spinner spinner--<size>" role="status" aria-label="Loading"></div>` styled by `./primitives.css`, on top of the inlined `release/tokens.inline.css`. Same ring recipe (`line-default` track + `primary-700` head), same diameters, same 750ms spin.
