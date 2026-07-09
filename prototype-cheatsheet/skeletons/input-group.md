### input-group — single-border container fusing an input with leading/trailing addons
Modifiers: `.input-group--block` (stacks a textarea + block addon), `.input-group--invalid/--disabled`. Addons: `.input-group__addon--inline-start/--inline-end/--block-start/--block-end`; the control gets `.input-group__control`; text affix = `.input-group__text`. Addons hold icons, text, or a `.btn--ghost`.
```html
<div class="input-group" role="group">
  <div class="input-group__addon input-group__addon--inline-start">
    <svg data-lucide="search">…</svg>
  </div>
  <input class="input input-group__control" type="search" placeholder="Search…">
  <div class="input-group__addon input-group__addon--inline-end">
    <span class="input-group__text">USD</span>
  </div>
</div>
```
