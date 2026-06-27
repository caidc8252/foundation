# Amount summary · composite

A totals block for order, cart, and checkout screens: a hairline separator followed
by a right-aligned stack of label → value rows (subtotal, discount, shipping, …) and
an emphasised grand-total row. Mono tabular-nums values keep currency amounts in
column alignment regardless of digit count.

> **Contract scope.** Cross-consumer design contract: anatomy, the row recipe, the
> total-row emphasis, tokens. NOT React prop types — those live with `@cloud/ui` +
> the `ui` skill. When the contract and an implementation disagree, the contract
> wins.

## Anatomy

```
┌ amount-summary ────────────────────────────────────┐
│ ──────────────────────────────────────────────────  │  ← hairline (border-top line-subtle)
│ Subtotal                             USD 1,200.00  │
│ Discount (10 %)                       − USD 120.00  │
│ ──────────────────────────────────────────────────  │  ← inner rule before total
│ Total                                USD 1,080.00  │  ← --total row (heavier ink)
└────────────────────────────────────────────────────┘
```

- **`.amount-summary`** — block root; carries the top `border-top` hairline that
  separates the totals block from the line items above it.
- **`.amount-row`** — a flex row, label left + value right (`justify-content: space-between`).
- **`.amount-row__label`** — muted axis (`text-sm`, `content-secondary`).
- **`.amount-row__value`** — mono, tabular-nums, right-aligned (`text-sm`, `content-primary`,
  `font-mono`, `font-variant-numeric: tabular-nums`).
- **`.amount-row--total`** — modifier on the grand-total row: heavier ink (`text-md`,
  `font-weight: 600`, `content-primary` on both sides) + an inner `border-top` and
  top spacing to lift it above the line items.

## Rules

- **Token-only values.** Currency strings are author-supplied; never format numbers
  in CSS. Provide the formatted string in the markup.
- **Top separator is the composite's, not the caller's.** `.amount-summary` owns its
  own `border-top`; the caller should not add a separate separator.
- **Always include a `.amount-row--total` row.** A totals block without a grand total
  is incomplete.
- **Place inside a card.** `.amount-summary` sits naturally at the bottom of a
  `card__content` or an order-summary section card; it does not carry its own card
  surface.

## States

No interactive states. Loading: swap each `.amount-row__value` for a `skeleton--text`
while `.amount-row__label` holds.

## Implementations

- **Next / @cloud/ui** — compose from the primitives; no dedicated component yet.
  Use `content-secondary` labels, `content-primary` mono values, and a `Separator`
  before the total row.
- **Artifact (self-contained HTML)** — `.amount-summary` (a `div` or `dl`) containing
  `.amount-row` children (each a `div` with `.amount-row__label` + `.amount-row__value`).
  Add `.amount-row--total` on the grand-total row. In `composites/composites.css`.

  ```html
  <div class="amount-summary">
    <div class="amount-row">
      <span class="amount-row__label">Subtotal</span>
      <span class="amount-row__value">USD 1,200.00</span>
    </div>
    <div class="amount-row">
      <span class="amount-row__label">Discount (10 %)</span>
      <span class="amount-row__value">− USD 120.00</span>
    </div>
    <div class="amount-row amount-row--total">
      <span class="amount-row__label">Total</span>
      <span class="amount-row__value">USD 1,080.00</span>
    </div>
  </div>
  ```
