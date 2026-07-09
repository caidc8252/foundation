# Combobox

A searchable single- or multi-select dropdown. A trigger that opens a portalled popup with a search box that filters a long option list by label text. Prefer over `Select` when the option set is long enough to benefit from a search box.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> part/slot vocabulary, the token recipe, states, anatomy, a11y. It is the
> authority both implementations answer to. It deliberately does NOT document
> the React prop *types* or base-ui specifics — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Parts

A combobox is a composed set of slots, not a single element. The trigger lives in the layout; the popup is portalled and holds the search box and the filtered list.

| part | role | token recipe |
|---|---|---|
| `trigger` | the closed control — shows the selected label(s) or placeholder | bg `surface-2` · text `content-primary` (`text-md`) · border `line-default` · radius `radius-md` · hover border `line-strong` · focus border `line-focus` + `shadow-focus` ring · trailing chevron `content-tertiary` · placeholder text `content-tertiary` |
| `content` (popup) | the floating surface that holds the search box and the list | bg `surface-2` · text `content-primary` · border `line-default` · radius `radius-md` · `shadow-4` · width tracks trigger (`--anchor-width`) with `min-w-36` floor |
| `search` (input row) | the filter input with a leading search glyph | leading `search` icon `content-tertiary` (`size-3.5`) · borderless `text-sm` input · placeholder `content-tertiary` · bottom hairline `line-subtle` |
| `list` | the scrollable option list | padding `--space-1` · max-height clamp + scroll *(see notes)* |
| `item` | one option row | radius `radius-md` · `text-sm` · text `content-primary` · highlight bg `surface-hover` · trailing check indicator when selected |
| `empty` | the "no matches" caption (only when `emptyText` is set) | centered `text-sm` · text `content-tertiary` · vertical pad `--space-4` |

## Sizes

The `trigger` takes a `size` prop. The vocabulary matches `Select` (two values), not the `xs/sm/md/lg` of Button/Input.

| size | height token | use |
|---|---|---|
| `sm` | `control-sm` (28px) | dense toolbars, inline filters |
| `md` *(default)* | `control-md` (36px) | standard |

The popup's search input is a fixed `control-md` (36px, source `h-9`) regardless of trigger size. There is no `lg`.

## States

- **hover** (trigger) — border lifts to `line-strong`.
- **focus-visible** (trigger) — border `line-focus` + the `shadow-focus` ring, same as every other bordered control.
- **disabled** (trigger) — `cursor-not-allowed` + `opacity-50`.
- **invalid** (`aria-invalid` on trigger) — border `error-strong` + 2px ring `error`/20.
- **placeholder** — when nothing is selected, the trigger value text renders `content-tertiary` (`data-placeholder`).
- **item highlighted** (keyboard/pointer focus, `data-highlighted`) — bg `surface-hover`. This is the active-row affordance; there is no separate `:hover` step in the source.
- **item disabled** (`data-disabled`) — `cursor-not-allowed` + `opacity-50`.
- **item selected** — trailing check icon (`size-3.5`) at the right edge; in multi-select every selected row shows it and the popover stays open while toggling.

## Anatomy

```
trigger   [ value / placeholder … ]                    [ chevron-down ]
              │
              ▼  (open → portalled popup)
content (popup surface)
├─ search   [ search-icon ] [ filter input … ]          (bottom hairline)
├─ empty    "No results"                                (only when emptyText set, list empty)
└─ list
   ├─ item    option label                              [ ✓ when selected ]
   ├─ item    option label
   └─ item    option label (disabled)
```

- **trigger** is a flex row: a truncating value span (single-select renders the selected label; multi-select joins selected labels with `, `; neither selected → placeholder in `content-tertiary`) and a trailing chevron-down (`size-3.5`, `content-tertiary`, non-interactive).
- **search** is a flex row: a leading non-interactive search glyph (`size-3.5`, `content-tertiary`) and a borderless transparent input; a bottom hairline (`line-subtle`) separates it from the list.
- **item** is a flex row with the label and trailing room (`padding-inline-end`) reserved for an absolutely-pinned check glyph that paints only when the option is selected.

## Accessibility

- Real combobox/listbox semantics from base-ui `Combobox`: the search input is the focused element, arrow keys roam the list, type filters by label text, Enter selects, Esc closes. All owned by the primitive.
- The trigger carries `aria-haspopup` / `aria-expanded`; focus returns to it on close.
- `aria-invalid` on the trigger drives the invalid skin; pair with a `<Label>`/`Field` for a name.
- Highlight follows keyboard focus — the skin must never remove the focus affordance, only restyle it as the `surface-hover` row.
- Focus ring is never removed, only restyled.

## Notes

- This is **base-ui** (`@base-ui/react/combobox`), not Radix. The wrapper normalizes `value` to `option | null` (or `option[]`) so the underlying Root is always controlled — passing `undefined` never flips it uncontrolled. `multiple` switches `value`/`onValueChange` to `string[]` and keeps the popover open while toggling.
- Size vocabulary is `sm` | `md` (default `md`), matching `Select`'s two-value axis — not the `xs/sm/md/lg` of other controls.
- The popup width tracks the trigger (`w-(--anchor-width)`) with a `min-w-36` (144px) floor; the reference CSS expresses the floor as `--space-` math.
- **List max-height is untokenized** — the source clamps the scroll area to `max-h-56` (224px); no sizing token lands there. The reference CSS keeps it as a raw value and flags a token-change wish (a `--popup-list-max-h` / popup-sizing token would close the gap — same family of wish noted in dropdown-menu.md and hover-card.md).
- `text-content-tertiary` / `text-content-primary` are the semantic tokens the source uses directly; the `dark:bg-surface-3/30` trigger tint is a dark-mode-only nicety that the token system handles via the theme flip — the reference layer paints the single `surface-2` ground.
- The contract documents the **static skin only** — see Implementations.

## Implementations

- **Next / @cloud/ui** — `import { Combobox } from "@cloud/ui"` (`ComboboxOption`, `ComboboxProps` types ship alongside). **Behavior is owned by the React implementation** (base-ui `Combobox`): triggering, portalling, positioning (`side="bottom"` / `sideOffset` / `align="start"`), open/close animation, label-text filtering, roaming focus, single-vs-multi selection state, and the empty-state swap are all base-ui. Props: `options` `value` `onValueChange` `placeholder` `searchPlaceholder` `emptyText` `disabled` `size="sm"|"md"` `invalid` `multiple`. API details: the `ui` skill. Do not re-skin via `className`; pick `size`/`invalid`.
- **Artifact (self-contained HTML)** — use the `.combobox` block classes in `./primitives.css`, on top of the inlined `release/tokens.inline.css`. The reference CSS expresses the **static skin only**: the resting trigger plus one open popup (search row + list). There is no portalling, positioning, open/close keyframes, label filtering, or live highlight tracking — render one open popup, mark the active row with `.combobox__item--highlighted` and selected rows with `.combobox__item--selected`. Same token recipe, same names.
