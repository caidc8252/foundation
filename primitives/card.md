# Card

A bordered content container. The default surface for grouping related content — panels, list shells, stat blocks, option tiles.

## Variants

A Card is a **slot composition**, not a single element. The root sets the frame; padding lives entirely on the slots. Slots: `Card` · `CardHeader` (with `CardTitle` / `CardDescription` / `CardAction`) · `CardContent` · `CardFooter`.

| part | token recipe |
|---|---|
| `Card` (root) | bg `surface-2` · text `content-primary` (`text-sm`) · border `line-default` · radius per `size` · elevation per `elevation` |
| `CardHeader` | bottom rule `line-subtle` · denser vertical padding than content |
| `CardTitle` | `text-md` `font-semibold` `content-primary` (drops to `text-sm` at `size=sm`) |
| `CardDescription` | `text-xs` `content-tertiary` |
| `CardAction` | header-right action slot, vertically centered against the title block |
| `CardContent` | size-based slot padding only |
| `CardFooter` | top rule `line-subtle` + size-based slot padding |

## Sizes

`size` controls radius and slot padding uniformly:

| size | radius token | slot padding |
|---|---|---|
| `sm` | `radius-lg` (8px) | `space-3` (12px) |
| `md` *(default)* | `radius-xl` (12px) | `space-5` (20px) |
| `lg` | `radius-2xl` (16px) | `space-6` (24px) |

`CardHeader` runs a denser rhythm at `md` (horizontal 20px, vertical 14px); `sm`/`lg` keep uniform slot padding.

## Elevation

| elevation | token | use |
|---|---|---|
| `0` | `shadow-none` | flat, on a tinted/inset surface |
| `1` *(default)* | `shadow-1` | resting card |
| `2` | `shadow-3` | lifted — hover / popover surfaces |

Resting cards stay at `1`; reserve `2` for hover/overlay.

## States

- **interactive** (`interactive` prop) — hover lifts border to `line-strong` + `shadow-3` + `cursor-pointer`. Use only on genuinely clickable cards.
- No focus/disabled state on the container itself — interactive cards should wrap a real link/button for keyboard access.

## Anatomy

```
Card
├─ CardHeader   [ CardTitle / CardDescription ] [ CardAction ]
├─ CardContent  arbitrary content
└─ CardFooter   actions / meta
```

`CardHeader` is a grid: it grows to two columns when a `CardAction` is present and two rows when a `CardDescription` is present. Header and footer carry hairline rules (`line-subtle`); content does not. Images placed as first/last child get their top/bottom corners rounded to match the card radius.

## Accessibility

- The card is a presentational container — it has no role of its own. For an `interactive` card, nest an actual `<a>`/`<button>` (or set proper role + key handling) so keyboard and AT users can act on it; `cursor-pointer` alone is not interactive.

## Notes

- **The root owns NO padding.** All padding lives on the slots (`CardHeader`/`CardContent`/`CardFooter`), driven by the root's `size` via a `group-data` variant. Do not expect content to be inset unless you use a slot.
- Because slot padding is a `group-data` variant class, a consumer's plain `p-0` can't override it (tailwind-merge won't dedupe across variants). Use the slot's `flush` prop for full-bleed content (tables, row lists) — rows then own their padding.
- **Table or row-list in a card → flush the content slot.** A `data-table` / row-list inside `CardContent` must use `flush` (artifact: add `.card__content--flush` to the `.card__content` holding it) so the slot drops its padding and the table sits flush to the card edges, aligned with the header rule — the table frame and rows own their spacing. A non-flush `card__content` double-pads the table and misaligns its edges. (Mechanism is the **card's**, not the table's; `.table-frame--flush` is a separate data-table concern — corner clipping / sticky — not this.)
- `CardAction` is vertically centered against the title block (team spec), not top-aligned like shadcn.

## Implementations

- **Next / @cloud/ui** — `import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from "@cloud/ui"`. Root props `size` `elevation` `interactive`; slot props include `flush`. API details: the `ui` skill. Compose slots; do not hand-pad the root.
- **Artifact (self-contained HTML)** — use `.card` + `.card__header` / `.card__content` / `.card__footer` in `./primitives.css`, on top of the inlined `dist/tokens.inline.css`. Padding lives on the slot classes, matching the contract.
