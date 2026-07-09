### status-card — a card carrying an object's health: media + badge + description + footer clusters
A status-card **is** a `.card` (inherits `.card--sm/--md/--lg`, `.card--interactive`). Structure: `.card__content > .stack.stack--3 > .status-card__head` (`.status-card__media` object-tile + `.status-card__heading` title+badge + `.status-card__trailing` chevron) `+ .status-card__description`; then `.card__footer` with `.status-card__footer-start` / `.status-card__footer-end` clusters.
```html
<div class="card status-card">
  <div class="card__content">
    <div class="stack stack--3">
      <div class="status-card__head">
        <span class="status-card__media">
          <span class="object-tile object-tile--md object-tile--neutral" aria-hidden="true">
            <span class="object-tile__icon"><svg data-lucide="database">…</svg></span>
          </span>
        </span>
        <div class="status-card__heading">
          <span class="card__title">Storage</span>
          <span class="badge badge--error"><span class="badge__dot" aria-hidden="true"></span>2 critical</span>
        </div>
        <a class="status-card__trailing" href="#" aria-label="View details"><svg data-lucide="chevron-right">…</svg></a>
      </div>
      <p class="status-card__description">…</p>
    </div>
  </div>
  <div class="card__footer">
    <div class="status-card__footer-start">
      <button class="switch" role="switch" aria-checked="true" aria-label="Monitoring enabled"><span class="switch__thumb"></span></button>
      <span>Enabled</span>
    </div>
    <div class="status-card__footer-end">
      <button class="btn btn--ghost btn--icon" aria-label="3 notifications"><svg data-lucide="bell">…</svg><span>3</span></button>
    </div>
  </div>
</div>
```
Interactive (whole card navigates): `.card--interactive` on root + wrap title in `<a class="status-card__link" href="#">`. Footer actions: `__footer-end` can hold `.btn--secondary` + `.btn--primary` instead of an icon button; drop `__footer-start` if no left cluster.
