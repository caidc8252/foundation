### action-footer — full-bleed bottom commit band (right-aligned action cluster)
Slots: `.action-footer > .action-footer__bar`. Lives as last child of `main.app-frame__main`, after `.page-body`. Arrangements: create-form (ghost Cancel + primary) · create-wizard (ghost Back + primary Continue).
```html
<footer class="action-footer">
  <div class="action-footer__bar">
    <button class="btn btn--ghost" type="button">
      <svg data-lucide="x">…</svg>
      Cancel
    </button>
    <button class="btn btn--primary" type="button">Create customer</button>
  </div>
</footer>
```
Wizard variant: replace with ghost Back (`<svg data-lucide="chevron-left">` + "Back") and primary Continue ("Continue" + `<svg data-lucide="chevron-right">`).
