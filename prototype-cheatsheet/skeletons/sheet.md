### sheet — edge-docked side panel sliding in over a dimmed scrim
Dock: `.sheet--right` (default) `.sheet--left` `.sheet--top` `.sheet--bottom`. Overlay `.sheet-overlay` (`--open` to show). Parts: `.sheet__close` `.sheet__header` `.sheet__title` `.sheet__description` `.sheet__body` `.sheet__footer`. Close × is a `.btn--ghost.btn--icon.btn--sm`.
```html
<div class="sheet-overlay sheet-overlay--open" data-sheet-id="right">
  <div class="sheet sheet--right" role="dialog" aria-labelledby="sh-title" aria-describedby="sh-desc">
    <button class="btn btn--ghost btn--icon btn--sm sheet__close" type="button" aria-label="Close">
      <svg data-lucide="x">…</svg>
    </button>
    <div class="sheet__header">
      <h2 class="sheet__title" id="sh-title">Member details</h2>
      <p class="sheet__description" id="sh-desc">View and edit team member information.</p>
    </div>
    <div class="sheet__body">…</div>
    <div class="sheet__footer">
      <button class="btn btn--ghost" type="button">Cancel</button>
      <button class="btn btn--primary" type="button">Save changes</button>
    </div>
  </div>
</div>
```
