### toast — transient auto-dismiss notification
Modifiers: `.toast--with-icon/--countdown/--loading`. Slots: `__icon`(+`--success/--info/--warning/--error/--loading`) `__content __title __description __close`.
```html
<div class="toast toast--with-icon">
  <span class="toast__icon toast__icon--success"><svg data-lucide="circle-check">…</svg></span>
  <div class="toast__content">
    <p class="toast__title">…</p>
    <p class="toast__description">…</p>
  </div>
  <button class="toast__close" type="button" aria-label="Close"><svg data-lucide="x">…</svg></button>
</div>
```
