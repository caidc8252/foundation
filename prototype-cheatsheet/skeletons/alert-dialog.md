### alert-dialog — forced-action confirm (Cancel / Confirm; no ×, no dismiss)
Modifiers: `.alert-dialog-overlay` (`--open` to show) `.alert-dialog` `.alert-dialog__header` `.alert-dialog__title` `.alert-dialog__description` `.alert-dialog__footer`. Destructive variant swaps confirm to `.btn--danger`. `role="alertdialog"`.
```html
<div class="alert-dialog-overlay alert-dialog-overlay--open" role="presentation">
  <div class="alert-dialog" role="alertdialog" aria-labelledby="ad-title" aria-describedby="ad-desc">
    <div class="alert-dialog__header">
      <h2 class="alert-dialog__title" id="ad-title">Delete account?</h2>
      <p class="alert-dialog__description" id="ad-desc">This action is permanent and irreversible. …</p>
    </div>
    <div class="alert-dialog__footer">
      <button class="btn btn--ghost" type="button" data-dialog-close>Cancel</button>
      <button class="btn btn--danger" type="button" data-dialog-close>Delete</button>
    </div>
  </div>
</div>
```
