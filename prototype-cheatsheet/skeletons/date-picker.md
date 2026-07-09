### date-picker — single-date field: a trigger that opens a calendar popover
Trigger: `.date-trigger` (`--sm/--md/--lg`, `--clearable`, `--invalid` or `aria-invalid`) › `.date-trigger__icon` + `.date-trigger__value` (`--placeholder` when empty). Clear button `.date-trigger__clear` is a sibling (not nested). Popover wraps a bare `.calendar` (see calendar skeleton) in a `.popover`.
```html
<div class="date-picker-wrapper">
  <div class="date-picker__clear-wrapper">
    <button class="date-trigger" type="button" aria-label="Pick a date">
      <svg class="date-trigger__icon" data-lucide="calendar">…</svg>
      <span class="date-trigger__value date-trigger__value--placeholder">Pick a date</span>
    </button>
    <button class="date-trigger__clear" type="button" tabindex="-1" aria-label="Clear"><svg data-lucide="x">…</svg></button>
  </div>
  <div class="date-picker__popover">
    <div class="popover" style="width:auto;padding:0;">
      <div class="calendar"><!-- calendar header + grid + optional footer --></div>
    </div>
  </div>
</div>
```
