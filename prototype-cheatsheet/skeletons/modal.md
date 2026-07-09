### modal — centered dialog over a dimmed scrim
`.modal-overlay` + `.modal` size `--sm/--md/--lg/--xl/--fullscreen`. Slots: `__header __heading __title __description __close __body __footer`.
```html
<div class="modal-overlay">
  <div class="modal modal--md" role="dialog" aria-modal="true">
    <div class="modal__header">
      <div class="modal__heading">
        <h2 class="modal__title">…</h2>
        <p class="modal__description">…</p>
      </div>
      <button class="modal__close" type="button" aria-label="Close"><svg data-lucide="x">…</svg></button>
    </div>
    <div class="modal__body">…</div>
    <div class="modal__footer">
      <button class="btn btn--ghost" type="button">Cancel</button>
      <button class="btn btn--primary" type="button">…</button>
    </div>
  </div>
</div>
```
