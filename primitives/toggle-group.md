# Toggle Group

A set of press-toggle buttons that act as one control: a segmented switch (radio-like, max one pressed) or a multi-select chip/segment cluster. The container picks the look; child `Toggle` items inherit it.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> variant/size vocabulary, token recipe, states, anatomy, a11y. It is the
> authority both implementations answer to. It deliberately does NOT document
> the React prop *types* (`type="single"`/`"multiple"`, `value`/`onValueChange`)
> or base-ui specifics — those live with the Next implementation (`@cloud/ui` +
> the `ui` skill). When the contract and an implementation disagree, the contract
> is right and the implementation is a bug.

## Variants

The *group* `variant` is the source of truth: the container restyles, and each
child `Toggle` reacts to the same `variant` purely from its place in the tree
(`data-variant` on the root → `in-data-[variant=…]` on the item) — no per-item
prop threading.

| variant | use | container recipe | item recipe (per state) |
|---|---|---|---|
| `outline` *(default)* | connected segments sharing one outer border (view / mode switch) | `inline-flex` · radius `radius-md` · border `line-strong` · bg `surface-2` · `overflow:hidden` clips item corners | items go borderless except a `line-strong` right divider (last item drops it); flat corners; bg `surface-2`, hover `surface-hover`, **pressed** bg `surface-active` |
| `segmented` | TOMS-style pill track for an OS / mode picker (pair with single-select) | `inline-flex` · radius `radius-md` · border `line-subtle` · tinted track bg `surface-3` · inner padding (track inset) + 1px gap | borderless transparent item, text `content-secondary`; hover → text `content-primary`; **pressed** lifts into a pill: bg `surface-2` + `shadow-1` + text `content-primary` |
| `cloud` | free-wrapping standalone chips (tag / category picker; single or multi) | `flex flex-wrap` · gap `--space-1` (≈`gap-1.5`) · **no track** | each item is its own `radius-full` chip, border `line-default`, bg `surface-2`, text `xs`/`content-secondary`; hover border `line-strong`; **pressed** tints: border `primary-500` + bg `primary-50` + text `primary-700` (weight 500) |
| `plain` | container only; children are custom option cards/tiles that own their own selected look | `flex flex-wrap` · gap `--space-2` · **no track, no child restyle** | unchanged — the caller's `Toggle`/card styling wins |

## Sizes

There is no size prop on the *group*. Fixed-height comes from each child
`Toggle`'s `size` (which keys off the same control scale as `Button`):

| size | recipe | use |
|---|---|---|
| `sm` | `control-sm` (28px) · `px-cx-sm` · `text-xs` | dense toolbars |
| `md` *(default)* | `control-md` (36px) · `px-cx-md` · `text-sm` | standard |
| `auto` | content-driven · `px-cx-md` · `py-2` · `text-sm` | option cards / tiles |

`cloud` items override height to content-driven (`px-cx-sm` + `--space-1` block padding, `text-xs`) regardless of the size prop, so the chip stays compact.

## States

Applied per child item; the group has no visual state of its own beyond layout.

- **pressed** (`data-pressed`, i.e. selected) — the per-variant pressed step above. In `outline` this is `surface-active`; in `segmented` it lifts to a `surface-2` pill with `shadow-1`; in `cloud` it tints `primary`. Selected always reads over hover.
- **hover** — `outline`/`plain` → `surface-hover`; `segmented` → text darkens to `content-primary` (track unchanged); `cloud` → border `line-strong`.
- **focus-visible** — `shadow-focus` ring on the focused item.
- **disabled** — `cursor-not-allowed` + `opacity-50`. The group can disable all items at once.

## Anatomy

```
ToggleGroup (container: track / cluster)
└─ Toggle item  [ icon? ] label [ icon? ]   ×N
```

- **outline** — items butt together inside one rounded, clipped border; each carries a right divider, the last drops it, so the seams read as one segmented control.
- **segmented** — a tinted recessed track with internal padding; items float on top and the pressed one rises into a shadowed pill.
- **cloud** — no track; items are independent rounded-full chips that wrap onto new lines.
- **plain** — a bare flex-wrap container; items render exactly as the caller styles them.

Each item is a `Toggle` (press-toggle button). Inline icons follow the `Toggle`/`Button` icon convention (auto gap, `shrink-0`, non-interactive). An item must carry a `value` so the group can match selection.

## Accessibility

- Real button semantics per item (base-ui `Toggle` → `aria-pressed`); the group is a keyboard-navigable set (arrow-key roving focus owned by base-ui `ToggleGroup`). Selection / focus management is **owned by the React implementation**.
- Single-select behaves radio-like (at most one pressed); multi-select toggles items independently — this is the group's `type`, a behavior contract, not a visual variant.
- Focus ring (`shadow-focus`) is never removed.
- Icon-only items need an accessible name (`aria-label`), same as icon-only buttons.

## Notes

- The `Toggle` item also exposes its own `variant` (`default`/`outline`) for standalone (non-grouped) use; inside a group, the *group* `data-variant` drives the look and these item-level variants are not the selection vocabulary.
- The `segmented` track uses a 2px inset padding and a 1px inter-item gap — neither has an exact space token (the raw scale floors at `--space-1` = 4px). The reference CSS uses the 1px hairline (conventionally exempt) for the gap and `--space-1` for the inset as the nearest token; a `--space-0_5` (2px) token would let the artifact match the React `p-0.5` exactly. Recorded as a token wish, not hardcoded beyond the exempt hairline.
- `plain` is intentionally style-free here — the contract only defines the container; selected styling lives with the caller's option-card component.

## Implementations

- **Next / @cloud/ui** — `import { ToggleGroup, Toggle } from "@cloud/ui"`. base-ui `ToggleGroup` + `Toggle` under the hood; group props `type` (`"single"`/`"multiple"`), `variant`, `value`/`defaultValue`/`onValueChange`, `disabled`; item props `value`, `size`, `pressed`. **Roving focus, selection, and keyboard nav are owned by the React/base-ui implementation; the reference CSS expresses the static skin only** (track surface, item border/divider/radius, pressed fill, typography, states). API details: the `ui` skill. Do not re-skin via `className`; pick a group `variant`.
- **Artifact (self-contained HTML)** — use `.toggle-group` + `.toggle-group--<variant>` on the container and `.toggle-group__item` (+ `.toggle-group__item--sm`/`--md`/`--auto`) on each item, on top of the inlined `dist/tokens.inline.css`. Mark the selected item with `aria-pressed="true"`. Same per-variant token recipe and names as the React side.
