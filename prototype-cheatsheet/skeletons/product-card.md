### product-card — catalog tile: image, name/SKU/description, price, add-to-cart
Grid: `.product-grid`. Each `.product-card[tabindex="0"]` = `.product-card__image` (an svg, or `.product-card__placeholder` emoji, or `.product-card__glyph`; optional `.product-card__ribbon .product-card__ribbon--{info|warning|success}`) + `.product-card__body` (`.product-card__name`, `.product-card__sku`, `.product-card__description`, `.product-card__price-row` [`.product-card__price` + optional `.product-card__options`], `.product-card__cta` [primary "Add to Cart" btn + `.product-card__add` quick-add icon button]).
```html
<div class="product-grid">
  <div class="product-card" tabindex="0">
    <div class="product-card__image">
      <svg data-lucide="monitor">…</svg>
      <div class="product-card__ribbon product-card__ribbon--info">New</div>
    </div>
    <div class="product-card__body">
      <div class="product-card__name">Reader Pro X</div>
      <div class="product-card__sku">SKU-RDR-PRO-X</div>
      <div class="product-card__description">Contactless EMV reader with NFC support…</div>
      <div class="product-card__price-row">
        <span class="product-card__price">1,299</span>
        <span class="product-card__options">3 options</span>
      </div>
      <div class="product-card__cta">
        <button class="btn btn--primary" onclick="event.stopPropagation()"><svg data-lucide="shopping-cart">…</svg>Add to Cart</button>
        <button class="product-card__add" onclick="event.stopPropagation()" aria-label="Quick add"><svg data-lucide="plus">…</svg></button>
      </div>
    </div>
  </div>
  …
</div>
```
Image fallbacks: `<span class="product-card__placeholder">📱</span>` or `<svg class="product-card__glyph">…</svg>`.
