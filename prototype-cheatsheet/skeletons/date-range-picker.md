### date-range-picker — a from→to date range field
Same trigger as date-picker (`.date-trigger` + `.date-trigger__icon` + `.date-trigger__value`, sibling `.date-trigger__clear`); value shows `from – to`. Popover = a `.date-presets` rail (`.date-presets__item` buttons) beside a two-month range calendar (two `.calendar`, using range-* day states). Disabled via `disabled` on the trigger.
```html
<div class="date-picker__clear-wrapper">
  <button class="date-trigger" type="button" aria-label="Pick a date range" aria-haspopup="dialog">
    <span class="date-trigger__icon" aria-hidden="true"><svg data-lucide="calendar">…</svg></span>
    <span class="date-trigger__value date-trigger__value--placeholder">Pick a range</span>
  </button>
  <button class="date-trigger__clear" type="button" aria-label="Clear" tabindex="-1"><svg data-lucide="x">…</svg></button>
</div>
<div class="popover" role="dialog" aria-label="Select date range" style="padding:0;width:auto;">
  <div style="display:flex;">
    <div class="date-presets">
      <button class="date-presets__item" data-preset="today" type="button">Today</button>
      <button class="date-presets__item" data-preset="last7" type="button">Last 7 days</button>
      …
    </div>
    <div class="date-range-calendars">
      <div class="calendar"><!-- left month --></div>
      <div class="calendar"><!-- right month --></div>
    </div>
  </div>
</div>
```
