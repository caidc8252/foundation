# Input

A single-line text field. The default control for short free-text, numbers, search, and credential entry.

## Variants

| variant | use | token recipe |
|---|---|---|
| `default` *(default)* | standard bordered field on a form surface | bg `surface-2` · text `content-primary` · border `line-default` · placeholder `content-tertiary` · focus border `line-focus` + `shadow-focus` ring |
| `filled` | tonal fill for dense toolbars / nested forms — border only on focus | bg `surface-3` · border transparent · hover `surface-hover` · focus bg `surface-2` |

Plus an orthogonal **validation** axis (independent of `variant`, see States): `warn` and `ok`.

## Sizes

| size | height token | use |
|---|---|---|
| `sm` | `control-sm` (28px) · padding `cx-sm` | dense toolbars, inline edits |
| `md` *(default)* | `control-md` (36px) · padding `cx-md` | standard |
| `lg` | `control-lg` (44px) · padding `cx-lg` · text `lg` | hero / single-field forms |

Body text is `text-md`; the `lg` size bumps to `text-lg`. Horizontal padding follows the `cx-*` scale; never an arbitrary px.

## States

- **hover** — no chrome change in `default`; `filled` lifts to `surface-hover`.
- **focus-visible** — border `line-focus` + the `shadow-focus` ring (the one focus-ring token every control shares; it *is* `line-focus` at 25%). Always visible on keyboard focus.
- **read-only** (native `readOnly`) — bg `surface-3` + text `content-secondary`, automatically.
- **disabled** — `cursor-not-allowed` + bg `surface-3` + `opacity-50`.
- **invalid** (`invalid` prop or `aria-invalid`) — border `error-strong` + 2px ring `error`/20. Sets `aria-invalid`; takes priority over `validation`.
- **validation `warn`** — border `warning-500` + focus ring `warning`/30.
- **validation `ok`** — border `success-500` + focus ring `success`/30.
- **loading** (`loading` prop / `.input--loading`) — async validation or a fetch is in flight: the field goes non-interactive (`pointer-events: none`) and a `primary-500` shimmer sweeps the bottom edge. The shimmer is the one allowed animated gradient (loading, principle #1); reduced-motion stops it. Drawn as an animated background because pseudo-elements don't render on `<input>`.

## Anatomy

`[ prefix? ] input [ suffix? ]` — `prefix`/`suffix` are optional non-interactive adornments (icon, unit, currency). When either is present the component wraps the input in a flex container that owns the border, focus ring, and error styling; the inner `<input>` goes borderless and transparent so only one ring shows. Without adornments the `<input>` is the bordered element directly.

> **That wrapper is `InputGroup` — it is not an `Input` internal.** There is no
> `.input__prefix` / `.input__suffix`. The adorned shape is the separate `input-group`
> primitive ([`input-group.md`](input-group.md)): React's `prefix`/`suffix` props render
> it for you, and an artifact composes it by hand.
>
> ```html
> <div class="input-group" role="group">
>   <input class="input input-group__control" type="number" placeholder="0.00">
>   <div class="input-group__addon input-group__addon--inline-end">
>     <span class="input-group__text">USD</span>
>   </div>
> </div>
> ```
>
> `.input-group__control` strips the inner field's own border/fill/ring so the group's
> single border shows; the group owns focus, invalid and disabled. Reach for it whenever
> an adornment, an action button, or a keyboard hint sits against the field.

## Accessibility

- Real `<input>` semantics; pair with a `<Label htmlFor>` (or wrap in `Field`) for click-to-focus.
- Error state must set `aria-invalid` (the `invalid` prop does this) so AT announces it; the visible red border is not enough on its own.
- Focus ring is never removed, only restyled.

## Notes

- The `className` prop lands on the inner `<input>`, not the outer flex container, when `prefix`/`suffix` are set. Layout classes (margin/width/self-align) applied via `className` will silently no-op in that case — wrap in your own `div` or use `InputGroup` for outer-container control.
- `inputSize` is distinct from the HTML `size` attribute.
- The `loading` shimmer period is pinned inline (`1.4s`), not a token — same call as the spinner's `750ms`; a `--duration-*` for indeterminate loops is a recorded wish.

## Implementations

- **Next / @cloud/ui** — `import { Input } from "@cloud/ui"`. base-ui `Input` under the hood; props `inputSize` `variant` `invalid` `validation` `prefix` `suffix`. Do not re-skin via `className`; pick a variant/size.
- **Artifact (self-contained HTML)** — use the `.input` class (plus size/state modifiers `.input--sm/--md/--lg`, `.input--filled`, `.input--warn/--ok`, `.input--loading`) in `./primitives.css`, on top of the inlined `release/tokens.inline.css`. Invalid is `aria-invalid="true"`; read-only/disabled are the native attributes. Same token recipe, same names. For a `prefix`/`suffix` adornment there is no `Input` class — compose `.input-group` (§Anatomy).
