### skeleton — loading placeholder (preserves layout)
Shapes: `.skeleton--line/--text/--title/--block/--circle`. Table scaffold: `.skeleton-row` (holds multiple `.skeleton--line`).
```html
<div class="skeleton skeleton--text" style="width:120px;"></div>
<div class="skeleton skeleton--circle" style="width:var(--space-10);"></div>
<div class="skeleton-row">
  <div class="skeleton skeleton--line" style="width:20%;"></div>
  <div class="skeleton skeleton--line" style="width:35%;"></div>
</div>
```
