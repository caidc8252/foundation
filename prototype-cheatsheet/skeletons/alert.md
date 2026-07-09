### alert — inline in-flow status message
Tone: `.alert--info/--success/--warning/--error`. Add `.alert--with-icon`. Slots: `__icon __title __description __action`.
```html
<div class="alert alert--warning alert--with-icon" role="alert">
  <svg data-lucide="triangle-alert" class="alert__icon">…</svg>
  <div>
    <div class="alert__title">…</div>
    <p class="alert__description">…</p>
  </div>
  <div class="alert__action"><button class="btn btn--ghost btn--xs" type="button">…</button></div>
</div>
```
