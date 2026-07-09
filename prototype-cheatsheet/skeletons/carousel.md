### carousel — horizontally (or vertically) scrollable track of equal-width slides
Root `.carousel` (`--vertical`), `role="region" aria-roledescription="carousel"`. Nav buttons `.carousel__nav.carousel__prev` / `.carousel__next` (styled as `.btn`). Content: `.carousel__viewport` › `.carousel__track` › `.carousel__item` (each `role="group" aria-roledescription="slide"`, inner `.carousel__item-inner`). Optional `.carousel__dots` › `.carousel__dot` (`--active`).
```html
<div class="carousel" role="region" aria-roledescription="carousel" aria-label="Featured slides">
  <button class="btn btn--secondary btn--icon btn--sm carousel__nav carousel__prev" type="button" aria-label="Previous slide"><svg data-lucide="chevron-left">…</svg></button>
  <div class="carousel__viewport">
    <div class="carousel__track">
      <div class="carousel__item" role="group" aria-roledescription="slide" aria-label="Slide 1 of 5">
        <div class="carousel__item-inner">…</div>
      </div>
      … <!-- more items -->
    </div>
  </div>
  <button class="btn btn--secondary btn--icon btn--sm carousel__nav carousel__next" type="button" aria-label="Next slide"><svg data-lucide="chevron-right">…</svg></button>
  <div class="carousel__dots">
    <button class="carousel__dot carousel__dot--active" type="button" aria-label="Go to slide 1"></button>
    <button class="carousel__dot" type="button" aria-label="Go to slide 2"></button>
    …
  </div>
</div>
```
