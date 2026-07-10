# Theme Toggle · composite

An icon-only button that flips the app between light and dark. Lives in the app
header / chrome; shows a moon in light mode (tap → go dark), a sun in dark mode
(tap → go light).

## Variants

Single visual form — no variant prop. It is a **ghost icon button**: the
`.btn--ghost` recipe at the `icon` size. No chrome at rest; surface appears only
on hover.

| part | token recipe |
|---|---|
| shell | transparent bg · text `content-secondary` · `radius-md` · 36px square (`spacing-control-md`) |
| hover | bg `surface-hover` · text `content-primary` |
| glyph | 18px sun/moon, `currentColor` (follows the text tone above) |

## Sizes

One fixed size — a 36px (`spacing-control-md`) square, matching the default
`.btn--icon`. No size prop.

## States

- **hover** — bg `surface-hover`, text lifts `content-secondary` → `content-primary`.
- **focus-visible** — `shadow-focus` ring; outline removed in favor of the ring.
- **light vs dark** — not a CSS state: the moon/sun swap is driven by the
  resolved theme from React (`useTheme().resolved`), not by `:checked` or a
  `data-*` attribute the static skin can observe. The reference skin renders
  whichever glyph the markup contains.

No disabled / invalid / selected states — the control is always live.

## Anatomy

```
┌ theme-toggle (36×36) ┐
│        ☾ / ☀         │   ← single centered glyph, content-secondary
└──────────────────────┘
```

A single `<button>` with one centered icon. The icon is the only slot — moon
when the resolved theme is light, sun when it is dark.

## Accessibility

- Real `<button type="button">` semantics — never a clickable `<div>`.
- Icon-only, so it carries an `aria-label` that names the *action*, flipping
  with the theme: "Switch to dark mode" (light now) / "Switch to light mode"
  (dark now). The glyph is `aria-hidden`.
- Focus ring (`shadow-focus`) is never removed, only restyled off the outline.
- `cursor-pointer` is intrinsic to the control.

## Implementations

- **Next / @cloud/ui** — `import { ThemeToggle } from "@cloud/ui"`. Reads/writes
  theme via the `useTheme` hook (resolved theme + `toggle`), so it must sit
  under a `ThemeProvider`. The light/dark resolution, the toggle, and the
  glyph swap are owned by the React implementation — the reference CSS expresses
  the static ghost-icon skin only.
- **Artifact (self-contained HTML)** — reuse the primitive ghost icon button:
  `<button class="btn btn--ghost btn--icon theme-toggle">` with a single inline
  sun/moon svg. The `.theme-toggle` modifier only quiets the resting text to
  `content-secondary` (the bare `.btn--ghost` rests at `content-primary`); hover
  lifts it back via the inherited ghost recipe. Wiring the actual flip is the
  artifact author's JS. In `composites.css`, on top of `primitives.css` + the
  inlined `release/tokens.inline.css`.

## Notes

- Behavior (theme resolution + toggle) is owned by the React implementation; the
  reference CSS is the static skin only.
- The source icon is **18px** (`width="18"`), which lands between space-scale
  steps (`--space-4` = 16, `--space-5` = 20). The skin pins it with a half-step
  calc over the scale (`--space-4 + --space-1/2`), mirroring how other composites
  (step-indicator, dropdown-menu) express off-scale glyphs. Token-change wish: a
  scale step at 18px would remove the calc.
