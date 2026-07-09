### stat-card — KPI tile: label, big value, inline trend delta
Grid wrapper: `.stat-grid .stat-grid--cols-{2|3|4}` (4-up collapses to 2-up on mobile). Card modifiers: `.stat-card--interactive` (pointer+hover, add `tabindex role=button aria-pressed`) · `.stat-card--selected`. Slots: `.stat-card__head (__label __icon) .stat-card__value (--success/--warning/--error/--info) .stat-card__delta (--up/--down/--flat) .stat-card__description`.
```html
<div class="stat-grid stat-grid--cols-4">
  <div class="stat-card">
    <div class="stat-card__head">
      <span class="stat-card__label">Orders</span>
      <span class="stat-card__icon"><svg data-lucide="activity">…</svg></span>
    </div>
    <div class="stat-card__value stat-card__value--info">
      1,892
      <span class="stat-card__delta stat-card__delta--up">▲ 7%</span>
    </div>
    <div class="stat-card__description">Updated 2 min ago</div>
  </div>
  …
</div>
```
Minimal: just `__head > __label` + `__value` (no icon/delta/description). Interactive: `<div class="stat-card stat-card--interactive" tabindex="0" role="button" aria-pressed="false">`.
