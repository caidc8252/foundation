### hover-card — rich popover opening on hover/focus over a trigger (preview / detail card)
Foundation exposes one class `.hover-card` (the card container/chrome); trigger, placement, and inner layout are composed at page level. In the source the card content is `__header` (avatar + `__info` › `__title` + `__subtitle`), `__body` (prose), and `__actions` (buttons) — these are authored layout, not separate foundation classes. Placement is app-driven (top/right/bottom/left).
```html
<span class="hc-trigger">
  <span tabindex="0" role="button" aria-label="Alice Chen preview">
    <span class="avatar avatar--lg" aria-hidden="true"><span class="avatar__fallback">AC</span></span>
  </span>
  <div class="hover-card" role="dialog" aria-label="Alice Chen preview">
    <div class="hover-card__header">
      <span class="avatar" aria-hidden="true">AC</span>
      <div class="hover-card__info">
        <div class="hover-card__title">Alice Chen</div>
        <div class="hover-card__subtitle">Senior Designer at Acme Corp</div>
      </div>
    </div>
    <div class="hover-card__body">…</div>
    <div class="hover-card__actions"><button class="btn btn--ghost btn--sm" type="button">…</button></div>
  </div>
</span>
```
