# Button

A clickable action. The primary way to trigger a mutation, submit, or navigate-as-action.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> variant/size vocabulary, the token recipe, states, anatomy, a11y. It is the
> authority both implementations answer to. It deliberately does NOT document
> the React prop *types* or base-ui specifics — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Variants

Canonical set — six variants only.

| variant | use | token recipe |
|---|---|---|
| `primary` *(default)* | the one main action on a surface | bg `primary-700` · text `content-on-primary` · `shadow-cta` · hover `primary-600` · active `primary-800` |
| `secondary` | neutral action beside a primary | bg `surface-2` · text `content-primary` · border `line-default` · `shadow-1` · hover `surface-hover` + border `line-strong` |
| `ghost` | toolbar / icon actions, no chrome until hover | hover bg `surface-hover` · active `surface-active` |
| `danger` | destructive primary (Delete, Terminate) | bg `error` · text `content-inverse` · `shadow-cta` · hover `error-strong` · active `error-active` |
| `ghost-danger` | destructive icon/low-emphasis action | text `error` · hover bg `error-bg` + text `error-strong` |
| `link` | inline text link styled as a button — e.g. the reveal control on a masked/sensitive value | text `primary-500` · hover underline · no height/padding |

> Not part of the closed set — do not use: `.btn--tertiary`,
> `.btn--outline`, `.btn--soft` (use `.btn--secondary`).

## Sizes

| size | height token | use |
|---|---|---|
| `xs` | 24px | dense tables, chips-as-buttons |
| `sm` | `control-sm` (28px) | secondary toolbars |
| `md` *(default)* | `control-md` (36px) | standard |
| `lg` | `control-lg` (44px) | hero / empty-state CTA |
| `auto` | content-driven | button-as-card (option tile, clickable row) |
| `icon` / `icon-xs` / `icon-sm` / `icon-lg` | square 32 / 24 / 28 / 36px | icon-only |

Horizontal padding follows the `cx-*` scale (`px-cx-sm/md/lg`); never an arbitrary px.

## States

- **hover / active** — per-variant steps above; selected/expanded (`aria-expanded`) reuses the hover surface.
- **focus-visible** — border `ring` + `shadow-focus` ring. Always visible on keyboard focus.
- **disabled** — `cursor-not-allowed` + `opacity-50`. `loading` implies disabled.
- **invalid** (`aria-invalid="true"`) — destructive border (`error-strong`) + a resting 2px `error`/20 ring. This is an **attribute**, not a modifier class — the same hook the other eight form controls carry, so an invalid button reads like an invalid field.
- **danger family focus** — `.btn--danger` and `.btn--ghost-danger` focus in the **error hue** (a 3px `error`/30 ring) instead of the default `shadow-focus`; a primary-blue ring around a red button reads as a different control. An `aria-invalid` button focuses in the error hue too. Ring geometry tracks `shadow-focus`; only the hue moves, and `--color-error` is theme-aware so dark mode follows.

## Anatomy

`[ iconLeft? ] label [ iconRight? ]` — icons are inline slots with auto gap. When `loading`, a spinner replaces `iconLeft` and the button is disabled. Inline icons default to 14px (`size-3.5`); an explicit `size-*` on the icon wins. Icon-only sizes drop the label and go square.

## Accessibility

- Real `<button>` semantics (role/keyboard/disabled) — never a clickable `<div>`.
- Icon-only buttons require an accessible name (`aria-label`).
- Focus ring is never removed, only restyled via `shadow-focus`.
- `cursor-pointer` is intrinsic to the control — consumers don't add it.

## Implementations

- **Next / @cloud/ui** — `import { Button } from "@cloud/ui"`. base-ui `Button` under the hood; props `variant` `size` `loading` `block` `iconLeft` `iconRight`. Prop/API details: the `ui` skill. Do not re-skin via `className`; pick a variant.
- **Artifact (self-contained HTML)** — use the `.btn` + `.btn--<variant>` + `.btn--<size>` classes in `../primitives/primitives.css`, on top of the inlined `release/tokens.inline.css`. Same token recipe, same names. The invalid state is the `aria-invalid="true"` attribute (§States), not a class — there is no `.btn--invalid`.
