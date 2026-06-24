# InitialsTile

A square, neutral identity tile that derives its initials from a name — a logo / icon placeholder for companies, apps, and people when no image exists.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> size vocabulary, the token recipe, the initials-derivation rule, anatomy, a11y.
> It is the authority both implementations answer to. It deliberately does NOT
> document the React prop *types* — those live with the Next implementation
> (`@cloud/ui` + the `ui` skill). When the contract and an implementation
> disagree, the contract is right and the implementation is a bug.

## Variants

Single visual variant — a square, rounded `surface`-class block on the dedicated
avatar tokens, with centered initials. There is no variant prop; only `size`
changes the rendering.

| part | token recipe |
|---|---|
| surface | bg `avatar-bg` (dedicated avatar token, NOT `surface-3`, so dark mode stays distinct from cards) |
| text | color `avatar-fg` · `font-sans` · weight 600 (semibold) |
| shape | square (1:1) · radius scales with size (see below) |

> **Distinct from Avatar.** `Avatar` is a *circular* profile picture that takes an
> image plus a caller-supplied fallback. `InitialsTile` is a *square* rounded
> block that has no image and computes its own initials. Use `Avatar` for round
> profile pictures, `InitialsTile` for square brand / identity marks.

## Sizes

The tile is square; `size` sets the side length, the corner radius, and the
font size together. `sm` is the default.

| size | side / recipe | radius | text | use |
|---|---|---|---|---|
| `xs` | 28px (`spacing-control-sm`) | `radius-md` | `text-xs` | dense rows, inline next to a label |
| `sm` *(default)* | 32px (`space-8`) | `radius-lg` | `text-xs` | list rows, menu items |
| `md` | 40px (`space-10`) | `radius-lg` | `text-sm` | cards, detail headers |
| `lg` | 48px (`space-12`) | `radius-xl` | `text-lg` (16px) | hero / page header identity mark |

> The space scale has no `--space-7` (28px) step, so `xs` borrows the
> equal-valued `--spacing-control-sm` (28px) for its side. `text-base` (16px) in
> the source maps to `--text-lg` (16px) here. See **Notes**.

## States

Static, non-interactive presentation element — no hover / active / focus /
disabled / invalid states. It is `aria-hidden` and never receives focus or
participates in tab order (see Accessibility). Any interactivity belongs to a
wrapping control, not the tile.

## Anatomy

A single square box centering the computed initials:

```
┌──────────┐
│          │
│    CP    │   ← initials, centered (grid place-items-center)
│          │
└──────────┘
```

- **Initials rule.** First letters of the first two words, uppercased. The name
  is split on whitespace **and** the separators common in app names / package
  ids — `.` `+` `_` `-` `/` — so `"com.acme.pos"` → `"CP"` and
  `"Newland Payment"` → `"NP"`. An empty / separator-only name renders `"?"`.
- The box does not shrink in flex layouts (`shrink-0`); it always holds its
  square footprint.

## Accessibility

- The tile is **decorative**: it renders `aria-hidden` and is removed from the
  accessibility tree. The derived initials are a visual shorthand, not the
  accessible name.
- Because it is hidden, the **real** name must be conveyed by an adjacent text
  node (the company / app / person label beside it) or the wrapping control's
  accessible name — never rely on the tile to announce identity.
- Not focusable and carries no role; it is a `<span>`, not a button or link.

## Notes

- **Token-scale gap (xs side).** The source `xs` is `size-7` (28px) but the raw
  `--space-*` scale skips 7. The nearest exact token at 28px is
  `--spacing-control-sm`; the reference CSS uses it so `xs` stays token-only with
  no hardcoded `28px`. Token-change wish: a `--space-7` (28px) step would make
  this a pure spatial mapping.
- **Avatar tokens are intentional.** `avatar-bg` / `avatar-fg` are used instead
  of `surface-3` / `content-primary` so the tile reads as an identity mark and
  can diverge from card surfaces in dark mode. Do not "simplify" to surface
  tokens.

## Implementations

- **Next / @cloud/ui** — `import { InitialsTile } from "@cloud/ui"`. Props:
  `name` (required, the source string for the initials), `size` (`xs`/`sm`/`md`/`lg`,
  default `sm`), `className`. The initials derivation lives in the component, not
  the caller — pass the raw name. Prop/API details: the `ui` skill. Do not
  re-skin via `className` to change the surface; the avatar tokens are the
  contract.
- **Artifact (self-contained HTML)** — use `<span class="initials-tile initials-tile--<size>">CP</span>`
  in `../primitives/primitives.css`, on top of the inlined `dist/tokens.inline.css`.
  Add `aria-hidden="true"`. The artifact author writes the already-derived
  initials as text content (there is no JS to compute them); apply the same
  first-two-words rule by hand. Same surface recipe (`avatar-bg` + `avatar-fg`).
