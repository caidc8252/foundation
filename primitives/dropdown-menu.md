# Dropdown Menu

A triggered overlay of grouped actions. The menu that drops from a button — actions, checkbox/radio toggles, sub-menus, labels, separators, and keyboard navigation.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> part vocabulary, the token recipe, item states, anatomy, a11y. It is the
> authority both implementations answer to. It deliberately does NOT document
> the React prop *types* or base-ui specifics — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Parts

A dropdown menu is a composed set of slots, not a single element. The popup is the surface; everything else is a row inside it.

| part | role | token recipe |
|---|---|---|
| `content` (popup) | the floating surface that holds the rows | bg `surface-2` · border `line-default` · radius `radius-lg` · `shadow-4` · text `content-primary` · padding `--space-1` · min-width 240px *(no token — see notes)* |
| `item` | a clickable action row | radius `radius-md` · `px-cx-sm`-ish (10px) · text `text-xs` · text `content-primary` · gap `--space-1.5` |
| `label` | a non-interactive group caption | `text-xs` UPPERCASE · tracking-wide · weight 500 · text `content-tertiary` |
| `separator` | a hairline divider between groups | 1px rule · bg `line-default` · vertical margin `--space-1` |
| `group` | wraps related items (semantic only, no skin) | — |
| `sub-trigger` | an item that opens a nested sub-menu | item recipe + trailing chevron · open-state bg `surface-hover` |
| `sub-content` | the nested sub-menu popup | content recipe · min-width 160px *(no token — see notes)* |
| `checkbox-item` | a toggleable row with a trailing check | item recipe · `text-sm` · trailing check glyph `--space-4` (16px) |
| `radio-item` | a single-select row with a trailing check | item recipe · `text-sm` · trailing check glyph `--space-4` (16px) |
| `shortcut` | trailing keyboard-hint text on an item | pushed right · `text-xs` · tracking-widest · text `content-tertiary` |

## Item variants

The action `item` has a tone axis (the only variant prop on the menu):

| variant | use | token recipe |
|---|---|---|
| `default` *(default)* | a normal action | text `content-primary` · focus bg `surface-hover` |
| `destructive` | a dangerous action (Delete, Revoke) | text `error-strong` · focus bg `error-bg` |

## Item states

Menu rows are driven by keyboard/pointer *highlight*, not CSS `:hover` — base-ui sets the highlighted row's `data-highlighted`/focus state, which the skin paints as the `focus` surface.

- **highlighted / focus** — bg `surface-hover` (destructive: `error-bg`). This is the active-row affordance; there is no separate `:hover` step.
- **open** (sub-trigger, `data-popup-open` / `data-open`) — holds the `surface-hover` highlight while its sub-menu is open.
- **disabled** (`data-disabled`) — `cursor-not-allowed` + `opacity-50`.
- **checked** (checkbox-item / radio-item) — the trailing check glyph is shown; the row body is unchanged (selection reads from the glyph, not a fill).

## Anatomy

```
content (popup surface)
├─ label                    "SECTION"            (uppercase caption)
├─ group
│  ├─ item        [ icon? ] label   … [ shortcut? ]
│  └─ item                          [ icon? ] label
├─ separator     ────────────────────────────
├─ checkbox-item            label                 [ ✓ ]   (trailing indicator)
├─ radio-item               label                 [ ✓ ]
└─ sub-trigger   [ icon? ] label                  [ › ]   → sub-content (nested popup)
```

- **item** is a flex row: optional leading icon, label, then an optional `shortcut` or indicator pushed to the trailing edge (`margin-inline-start: auto`). Leading icons in actions default to 14px (`--space-3.5`-equivalent → nearest `size-3.5`).
- **checkbox-item / radio-item** reserve trailing room (`padding-inline-end`) for an absolutely-pinned 16px check glyph; the glyph paints only when checked.
- **sub-trigger** appends a trailing chevron (`›`) and, on open, keeps the highlight surface.
- **inset** — `label`, `item`, `sub-trigger`, `checkbox-item`, `radio-item` accept an `inset` flag that pads the leading edge by `calc(var(--space-6) + var(--space-1))` (28px — the scale has no `--space-7` step) so text aligns under siblings that carry a leading icon.

## Accessibility

- Real menu semantics from base-ui `Menu`: `role="menu"` / `menuitem` / `menuitemcheckbox` / `menuitemradio`, arrow-key roaming focus, type-ahead, Esc to close, Enter/Space to invoke.
- The trigger carries `aria-haspopup` / `aria-expanded`; focus returns to the trigger on close.
- Highlight follows keyboard focus — the skin must never remove the focus affordance, only restyle it as the `surface-hover` row.
- Icon-only rows still need an accessible label.

## Notes

- **A menu row is a `.dropdown-menu__item`, never a `.btn`.** Rows use the item
  recipe above — `default`, or the `destructive` variant
  (`.dropdown-menu__item--destructive`, `error-strong` text) for Delete / Revoke.
  Do **not** drop a `secondary` / `danger` / `ghost` **button** inside a menu: that
  is the "re-skin via className" this contract forbids, and it renders a stray
  control where a quiet menu row belongs. (A standalone `danger` **button** is the
  *alternative* carrier — used **instead of** a menu, not within one.)
- **min-width is hardcoded** in the source: content `min-w-[240px]`, sub-content `min-w-[160px]`. No sizing token expresses these popup widths. The reference CSS keeps them as raw px and flags a token-change wish here (a `--popup-width-*` / menu-min-width token would close the gap — same wish noted in hover-card.md).
- **Rows fill the popup width — the skin owns this now.** A menu row is a `<button>`
  (a form control): it shrink-wraps to its content and does **not** stretch to the
  popup width on its own — even in a definite-width popup — so the highlight / hit
  target and any trailing `shortcut` (`margin-inline-start:auto`) would stop short of
  the row edge, and narrower rows look ragged. The skin fixes this centrally:
  `.dropdown-menu__item`, `.dropdown-menu__sub-trigger`, `.dropdown-menu__checkbox-item`,
  `.dropdown-menu__radio-item` all carry `width:100%` (with the global border-box), so
  rows fill the popup whether it is sized by `min-width` (shrink-to-fit),
  `position:absolute` in a wrapper, or portalled + `position:fixed`. **Don't** re-add a
  per-artifact `width:100%` on rows or reach for a definite popup width to force the
  fill — that was the old workaround before the skin owned it.
- **The popup `max-height` is `80vh`, not `100%`** (matches `.modal`/`.sheet`). A
  percentage `max-height` resolves against the *containing block*, so the taught
  detail-header pattern — a kebab trigger with the popup `position:absolute` inside a
  trigger-sized `.overflow-wrap` — makes `100%` collapse to the **trigger's height**
  (~36px), clipping the menu to a stub. `vh` is containing-block-independent, so the
  cap holds whether the popup is absolute-in-wrapper or portalled+`fixed`. Don't
  reintroduce a `%` height here.
- The source's `bg-border` (separator) and `text-muted-foreground` (shortcut) are shadcn aliases; they resolve to `line-default` and `content-tertiary` in this token system.
- Action `item` uses `text-xs` (12px) while `checkbox-item` / `radio-item` use `text-sm` (13px) — kept faithfully; do not normalize them.
- The contract documents the static skin only — see Implementations.

## Implementations

- **Next / @cloud/ui** — `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuShortcut } from "@cloud/ui"`. **Behavior is owned by the React implementation** (base-ui `Menu`): triggering, portalling, positioning (`side`/`align`/offsets), open/close animation, roaming focus, type-ahead, checkbox/radio state, and sub-menu open are all base-ui. `DropdownMenuItem` takes `variant="default" | "destructive"`. API details: the `ui` skill. Do not re-skin via `className`.
- **Artifact (self-contained HTML)** — use the `.dropdown-menu` block classes in `./primitives.css`, on top of the inlined `release/tokens.inline.css`. The reference CSS expresses the **static skin only** — the resting open popup and its rows. There is no portalling, positioning, open/close keyframes, or interactive highlight tracking; render one open popup and mark the active row with `.dropdown-menu__item--active`. Same token recipe, same names.
