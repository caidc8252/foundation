# ColorTile

A square identity tile that shows a **full** label on a background tinted deterministically from its content — e.g. a device-model code `N950` / `X900` wrapped inside a colored square. Sibling to `InitialsTile`.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> size vocabulary, the token recipe, the content→color hashing rule, anatomy,
> a11y. It is the authority both implementations answer to. It deliberately does
> NOT document the React prop *types* — those live with the Next implementation
> (`@cloud/ui` + the `ui` skill). When the contract and an implementation
> disagree, the contract is right and the implementation is a bug.

## Variants

No variant prop. The **fill is data-driven**: the label (or an explicit
`colorSeed`) is hashed to one of **6 stable buckets**, each bucket mapping to a
`cat-*` soft-tint pair. The same seed always lands on the same bucket; different
seeds may collide onto the same bucket — an accepted trade-off for stable,
no-config tinting (see `categorical-color.ts`). A shared neutral hairline
(`cat-line`) frames every tile regardless of hue.

| part | token recipe |
|---|---|
| fill | `bg cat-N` (pale same-hue tint, `N` = `1..6` from the hash) |
| ink | `text cat-N-fg` (readable same-hue ink, paired to the fill) |
| frame | `border cat-line` (one neutral hairline, hue-independent) |

> **Bucket palette (`cat-1..6`).** 1 blue · 2 orange · 3 green · 4 azure ·
> 5 lime · 6 red. Light + dark values are baked into the `cat-*` tokens, so the
> theme cascade handles dark mode — there is no per-mode logic in the component.

> **Distinct from InitialsTile.** Both are square rounded blocks. `InitialsTile`
> shows *computed initials* on a neutral `avatar-bg` surface; `ColorTile` shows
> the *whole label*, tinted by a content hash. Use `InitialsTile` for a person /
> company mark, `ColorTile` for a short identity code you want color-coded.

## Sizes

The tile is square: `size` sets the side width, and `aspect-square` derives the
height. Corner radius scales with size. The **font is not pinned by size** — it
scales fluidly with the tile's own width (a container `cqw` clamp), so a
multi-char label stays whole at any size, including a responsive `w-full` tile.

| size | side width | radius | use |
|---|---|---|---|
| `sm` | 40px (`space-10`) | `radius-lg` | dense rows, inline next to a label |
| `md` *(default)* | 56px contract → CSS pins `space-16` (64px, see Notes) | `radius-lg` | standard cards / detail rows |
| `lg` | 80px (`space-20`) | `radius-xl` | hero / page-header identity mark, sticky summary preview |

Callers may also pass a width override (`w-full` in the source) to get a
responsive square that fills its container; the fluid font keeps the label
legible below the `sm` preset.

## States

Static, non-interactive presentation element — no hover / active / focus /
disabled / invalid states. It is `aria-hidden` and never receives focus or
participates in tab order (see Accessibility). Any interactivity belongs to a
wrapping control, not the tile.

## Anatomy

A single square box centering the full, wrapping label:

```
┌──────────┐
│          │
│   N950   │   ← full label, centered + wrapping (grid place-items-center)
│          │
└──────────┘
```

- **Color rule.** `colorSeed ?? label` is hashed (FNV-1a, mod 6) to a bucket
  `0..5`; the bucket picks the `cat-(N+1)` / `cat-(N+1)-fg` fill+ink pair.
  Override `colorSeed` when the displayed text differs from the identity you
  want the color keyed on.
- **Label.** Wraps (`break-words` / `whitespace-normal`), centered, `leading-tight`,
  weight 600 (semibold). Fluid size ≈ 28% of the tile width, clamped 8px–32px.
- The box clips overflow, does not shrink in flex layouts (`shrink-0`), and pads
  its content by a hairline gutter so the label never touches the frame.

## Accessibility

- The tile is **decorative**: it renders `aria-hidden` and is removed from the
  accessibility tree. The tinted label is a visual shorthand, not the accessible
  name — the color carries no semantics a screen reader should announce.
- Because it is hidden, the **real** identity must be conveyed by an adjacent
  text node or the wrapping control's accessible name — never rely on the tile.
- Not focusable and carries no role; it is a `<span>`, not a button or link.

## Notes

- **Token-scale gap (md side).** The source `md` is `w-14` (56px), but the raw
  `--space-*` scale skips 14 — it jumps `--space-12` (48px) → `--space-16`
  (64px), with no exact 56px step. The reference CSS keeps `md` token-only by
  pinning the larger neighbour `--space-16` (64px) so it stays clearly distinct
  from `sm` (40px); the contract side is the canonical 56px. **Token-change
  wish:** a `--space-14` (56px) step would make `md` a pure, exact mapping
  (parallel to the `--space-7` gap noted in `initials-tile.md`).
- **Fluid font is intentional.** The label size is `clamp(0.5rem, 28cqw, 2rem)`
  against the tile's own width (a `@container` size query), generalizing the old
  fixed `text-xs/sm/base` presets that clipped below the `sm` size. The clamp
  bounds (8px / 32px) are not part of the token type scale — they are intrinsic
  to the fluid behavior, not theming knobs, so they are conventionally exempt
  like a percentage/`cqw` unit. The reference CSS expresses the same clamp.
- **`cat-*` tokens are the contract.** Do not re-skin the fill via `className`
  to a non-`cat` color — the deterministic categorical palette is the whole
  point. There are exactly 6 buckets (`CATEGORICAL_COLOR_COUNT`); keep the
  TONE list and the bucket count in lockstep.

## Implementations

- **Next / @cloud/ui** — `import { ColorTile } from "@cloud/ui"`. Props: `label`
  (required, full text shown), `colorSeed` (optional, defaults to `label`),
  `size` (`sm`/`md`/`lg`, default `md`), `className`. The hash→bucket→tone
  derivation lives in the component (via `categoricalColorIndex`), not the
  caller — pass the raw label. Prop/API details: the `ui` skill.
- **Artifact (self-contained HTML)** — use
  `<span class="color-tile color-tile--<size> color-tile--cat-N">N950</span>`
  in `../primitives/primitives.css`, on top of the inlined `dist/tokens.inline.css`.
  Add `aria-hidden="true"`. There is no JS to compute the bucket: the artifact
  author **picks the `--cat-N` tint by hand** (any of `1..6`), or applies the
  same FNV-1a-mod-6 rule manually for content-stable parity. The fluid-font
  `cqw` clamp needs a sizing container — the tile sets `container-type: inline-size`
  on itself, so the `cqw` references its own width with no extra wrapper.
