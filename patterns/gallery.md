# Pattern · Gallery

"Browse a collection as a grid of **tiles**, not rows." A responsive grid of
cards — each led by an image/visual — that you scan, filter, and open. The tile
counterpart to [`list-page`](./list-page.md): reach for it when an item's **picture
is the primary thing to compare** (a product catalog, an image/asset gallery, a
device-model or template picker), not its columns.

> 📐 **Copyable example** · [`gallery.html`](./gallery.html) — a product catalog:
> page-header → a search/filter condition-band → a `product-grid` of `product-card`
> tiles → **scroll-driven auto-load** (infinite scroll). It **links** the reference
> CSS so it never forks; inline the blocks to ship it as an artifact. All examples:
> [`index.html`](./index.html).

## When to use — vs. list-page / dashboard

- **gallery** — the collection is **visual**; you compare items by their image and
  open one to act. Tiles in a responsive grid (`product-grid`), each a click target
  to its detail. Products, images, models, templates, media.
- **list-page** — the collection is **structured**; you scan/sort/compare columns
  (dates, amounts, statuses) and act on rows. A `data-table`, not tiles. If the user
  needs to sort by a column or bulk-select rows, that's list-page.
- **dashboard** — a fixed KPI/overview of a whole system, not a browsable collection.

The two browse patterns **share their results-region vocabulary** — the same
`page-header`, the same search/filter [`condition-band`](../composites/list-filter.md),
the same pagination footer. Only the results *body* differs: a `product-grid` of
tiles here, a `data-table` there.

## Anatomy

```
┌ page-header (○) ──────────────────────────────────────────────┐
│ Title (+ count?)                                 [ + New ? ]   │
╞═══════════════════════════════════════════════════════════════╡
│ ┌ condition-band — search + filters (○) ──────────────────────┐│
│ └─────────────────────────────────────────────────────────────┘│
│ ┌ ■ product-grid (auto-fill, ~ container-width columns) ───────┐│
│ │ ┌ tile ┐ ┌ tile ┐ ┌ tile ┐ ┌ tile ┐                          ││
│ │ │ 🖼   │ │ 🖼   │ │ 🖼   │ │ 🖼   │  ← product-card             ││
│ │ │ name │ │ name │ │ name │ │ name │                          ││
│ │ └──────┘ └──────┘ └──────┘ └──────┘                          ││
│ │ ┌ tile ┐ ┌ tile ┐ …           …or an empty-state when none   ││
│ └──────────────────────────────────────────────────────────────┘│
│ footer (○): scroll-driven auto-load  ·  or load-more  ·  or     │
│             rich-pagination                                     │
└───────────────────────────────────────────────────────────────┘
```

### Required core vs. optional slots

A gallery is a **framework**, not a filled-in template (governance principle
[#9](../governance/principles.md)). The **required core** is the tile grid — the
results region. Everything around it is optional.

| slot | required? | include when |
|---|---|---|
| tile grid (`product-grid` of tiles) | **yes** | always — the collection, as tiles |
| page-header | no | the screen wants a title and/or a **New** primary |
| search / filter (`condition-band`) | no | the collection is large enough to filter or search |
| footer — scroll-driven auto-load, `load-more`, or `rich-pagination` | no | the collection spills past one page (see the pagination rule for which) |
| empty-state | no | the filter/search returns nothing, or the collection is empty (render it **in place of** the grid) |

## Rules

- **The grid is `product-grid`; the tile is `product-card`.** `product-grid` lays out
  responsive **auto-fill** columns that follow the *container's* width (not viewport
  breakpoints) — never hand-roll a `repeat(...)`. Each tile is a `product-card`
  (image/placeholder → name → optional sku/description → price-row → cta), and **the
  whole tile is the click target** to that item's detail-page; nested actions
  (add-to-cart, quick-add) `stopPropagation`.
- **Don't use a `data-table` here — that's `list-page`.** Gallery and list-page are
  the two shapes of the same "browse a collection" job; pick by whether the item is
  scanned **visually** (gallery) or by **columns** (list-page). Don't mix a table into
  a gallery, and don't tile a list-page's rows.
- **Filtering/search reuses the list-page results vocabulary** — the same
  [`condition-band`](../composites/list-filter.md) (search + quick filters + optional
  Advanced), so the two browse patterns feel identical above the results. It scrolls
  with the body (not sticky) unless the screen opts into a sticky results region.
- **The footer has three sanctioned modes** — pick one; the grid never uses numbered
  *jump* targets inline. (1) **scroll-driven auto-load** (the example): the grid appends
  the next batch as the bottom comes into view — the `onReachEnd` behavior
  [`load-more`](../composites/load-more.md) points to for scroll loading, **not** a
  button. Surface state with the `load-more` zones: `load-more__summary` ("Showing X of
  N") while more remain, the `load-more__end` marker once exhausted. (2) **`load-more`
  (click)** — the append-on-click button, for when auto-load isn't wanted. (3)
  **`rich-pagination`** — numbered pages, for a bounded catalog the user jumps around.
  Modes (1)/(2) are the same footer composite in its scroll vs click trigger.
- **Empty → `empty-state`** rendered in place of the grid (no results for the filter,
  or an empty collection), never an empty grid frame.
- **At most one primary** in the header (a **New**/create verb), rightmost — a
  read-only catalog has none. Per-item verbs live on the tile (its cta), not the
  header.

## Variants & optional slots

- `storefront` — buyer-facing catalog: tiles carry a **price-row + add-to-cart** cta
  (the example). Lifted from the handoff's `shop-browse`.
- `asset-gallery` — an admin/asset grid (images, device models, templates): tiles are
  image + name + a **status ribbon / `⋯`**, **no price/cart**. Same `product-grid`;
  the tile drops the price-row and cta (or swaps the cta for a manage menu).
- `picker` — the gallery is a **selection surface** (pick a template/model to
  continue): tiles select rather than navigate; pair with a footer action.

## Building blocks

Composites: [`page-header`](../composites/page-header.md) (title + optional New
primary), [`product-card`](../composites/product-card.md) (the tile **and** its
`product-grid`), [`list-filter`](../composites/list-filter.md) (the search/filter
`condition-band`), [`rich-pagination`](../composites/rich-pagination.md) or
[`load-more`](../composites/load-more.md) (the footer), and
[`empty-state`](../composites/empty-state.md) (no results / empty). Primitives
underneath: `Card`, `Badge`, `Button`, `Input`, `Select`. `@cloud/ui`: an artifact
composes the same from `primitives.css` + these composites — no new layout class, the
grid IS `product-grid`.
