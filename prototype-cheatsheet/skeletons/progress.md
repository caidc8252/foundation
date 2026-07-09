### progress — numeric completion bar (0–100%)
`.progress __track __indicator` (tone `--success/--warning/--error/--info`) `__label __value`. Width via inline `style="width:N%"`.
```html
<div class="progress">
  <div style="display:flex;align-items:center;width:100%;"><span class="progress__label">…</span><span class="progress__value">64%</span></div>
  <div class="progress__track"><div class="progress__indicator" style="width:64%"></div></div>
</div>
```
