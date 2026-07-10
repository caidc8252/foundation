# Product card · composite

A catalog tile for one sellable thing: a product image, its name / SKU / short
description, a price, and an add-to-cart affordance — laid out as a card and
tiled into a responsive grid. This is the **storefront list**, the card-grid
cousin of the table: where `data-table` lists records as rows for an operator,
`product-card` + `product-grid` present a *catalog* a buyer browses. Lifted from
the carbon-admin portal's `shop-browse` screen. (The admin-side product
*management* list is a `data-table`, already covered — this is specifically the
shopping catalog.)

> **Contract scope.** The cross-consumer design contract: anatomy, the
> click-target rule, the grid, tokens, states. NOT the React prop types — those
> live with `@cloud/ui` + the `ui` skill. When an implementation disagrees with
> this file, the file wins.

## Anatomy

```
product-grid  (auto-fill columns, ~300px min — count follows CONTAINER width)
┌ product-card ──────────────┐ ┌ product-card ──────────────┐
│ ┌ image ───────〔ribbon〕┐ │ │ ┌ image ─────────────────┐ │
│ │     [ product image ]   │ │ │ │   [ glyph placeholder ] │ │
│ └─────────────────────────┘ │ │ └─────────────────────────┘ │
│ Reader Pro X                │ │ Cable, USB-C 2m             │
│ SKU-RDR-PRO-X   (tabular)   │ │ SKU-CBL-USBC-2M             │
│ Contactless EMV reader.     │ │ Braided, 100W PD.           │
│ ¥1,299          3 options   │ │ ¥59                         │  ← price-row, pinned to bottom
│ [ 加入购物车 ]        [ + ] │ │ [ 加入购物车 ]        [ + ] │  ← cta
└─────────────────────────────┘ └─────────────────────────────┘
```

- **Image** — a fixed-height, neutral panel; the image is `object-fit: contain`
  (shown whole, never cropped). Falls back to a `placeholder` / tinted `glyph`
  when there's no asset. An optional diagonal **ribbon** carries a status
  (Sample / New / Sale).
- **Body** — `name` (weight 600), optional `sku` (tabular, tertiary), a one-line
  clamped `description`, then the **price-row** and **cta**.
- **Price-row** — `price` (tabular) left, an optional `options` count
  ("3 options") right. Pinned to the card's bottom so cards in a row align
  regardless of name/description length.
- **CTA** — a primary "add to cart" button + an optional icon `add` button.

## Rules

- **The whole card is the click target** → the product detail page. The CTA
  buttons are nested actions that must stop propagation (add-to-cart without
  navigating). Like an `interactive` `Card`, wrap a real link/button for
  keyboard access — `cursor-pointer` alone is not interactive.
- **Image is contained, on a quiet surface** — products vary in aspect ratio;
  `contain` on a neutral panel keeps the grid even. Never `cover`/crop a product
  shot, and don't stretch a small asset.
- **Price-row sticks to the bottom** (`margin-block-start: auto`) so price + CTA
  line up across a row even when names wrap to two lines and descriptions don't.
- **Description is clamped to one line** — a catalog tile is scannable, not a
  spec sheet; the detail page carries the full copy.
- **Ribbon tone is status, not decoration** — reserve it for a real signal
  (Sample unit, New, on Sale); most cards carry none.
- Price is `tabular-nums` so figures don't reflow as the grid re-lays.

## States

- **hover** — the card lifts: border `line-strong`, `shadow-2`, a 1px rise.
- **loading** — a `skeleton` card (image block + two lines + a price bar) stands
  in while the catalog loads.
- **empty (no results)** — the grid is replaced by an `empty-state`, never left
  blank.

## Building blocks around it

A catalog screen is `page-header` (or a shop head) + `list-filter` (the filter
bar) + a `summary-bar` / result count + the `product-grid` of `product-card`s +
`load-more`. This composite is just the tile + its grid; those neighbours are
their own composites.

## Implementation notes

Cross-consumer guards. Most values are tokens, but this composite carries the
**most non-token layout literals of the set** — copy them, don't re-derive:

- **The ribbon geometry is exact, not approximate.** The diagonal corner band is
  `width: 8.125rem` (130px, `w-[8.125rem]`) · `inset-inline-end: -2.25rem` (`-right-9`) ·
  `top: cx-md` (14px) · `rotate(45deg)` · `transform-origin: center`, inside an
  `overflow-hidden` image box. These are tuned so both ends overshoot the edges
  and clip into a clean band; **shrinking the width leaves a clipped sliver** (a
  real bug we hit). Copy the values verbatim — or implement the ribbon as a
  corner-box + inner span to avoid the magic numbers entirely.
- **Other non-token measures** (Tailwind arbitrary values): image height
  `9.375rem` (150px, `h-[9.375rem]`); grid tile threshold `18.75rem` (300px,
  inside the `auto-fill` `minmax`); hover lift `translateY(-1px)`.
- **Grid columns follow the CONTAINER**: `auto-fill` + `minmax(min(18.75rem,100%),1fr)`,
  not viewport breakpoints — same rule as `kv-grid` / `grid-auto-fit-kv`.
- **Price-row pins to the bottom** (`mt-auto`) so price + CTA align across a row
  regardless of name/description length — structural, not cosmetic.
- **Description clamps to one line** (`line-clamp-1`).
- **Whole card is the click target → detail; the CTA stops propagation.** Wrap a
  real link; the add button is a nested action, not the card's own click.

## Implementations

- **Next / @cloud/ui** — an `interactive` `Card` composing an image slot,
  `Badge` (ribbon), price typography, and `Button`s for the CTA, tiled by a
  `grid-auto-fit` utility; this contract names the catalog-tile structure. See
  the `ui` skill.
- **Artifact** — `.product-card` → `.product-card__image` (with
  `.product-card__placeholder` / `__glyph` fallback and an optional
  `.product-card__ribbon--<tone>`), `.product-card__body` (`__name` / `__sku` /
  `__description` / `__price-row` [`__price` + `__options`] / `__cta` with
  `.btn--primary` + `.product-card__add`). Tile them in `.product-grid`. In
  `composites.css`.
