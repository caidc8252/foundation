### date-time-picker — a single date + time field
Same trigger as date-picker (icon = `calendar-clock`). Popover holds a `.calendar` plus a `.date-time-row` (top hairline) carrying `.date-time-row__label` + a `type="time"` `.input` + an OK `.btn`. A date-time *range* is two of these fields side by side (Start / End), not a dual-calendar.
```html
<div class="date-picker__clear-wrapper">
  <button class="date-trigger" type="button">
    <svg class="date-trigger__icon" data-lucide="calendar-clock">…</svg>
    <span class="date-trigger__value date-trigger__value--placeholder">Pick a date and time</span>
  </button>
  <button class="date-trigger__clear" type="button" aria-label="Clear date"><svg data-lucide="x">…</svg></button>
</div>
<div class="popover" style="width:auto;min-width:260px;">
  <div class="calendar">
    <div class="calendar__header">
      <button class="calendar__nav-btn" type="button" aria-label="Previous month"><svg data-lucide="chevron-left">…</svg></button>
      <span class="calendar__caption">June 2026</span>
      <button class="calendar__nav-btn" type="button" aria-label="Next month"><svg data-lucide="chevron-right">…</svg></button>
    </div>
    <div class="calendar__grid"><!-- days --></div>
  </div>
  <div class="date-time-row">
    <label class="date-time-row__label" for="dt-time">Time</label>
    <input class="input input--sm" type="time" id="dt-time" value="09:30" style="flex:1;">
    <button class="btn btn--sm" type="button">OK</button>
  </div>
</div>
```
