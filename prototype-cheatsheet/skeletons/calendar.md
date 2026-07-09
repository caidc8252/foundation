### calendar — base month grid: weekday header over a 6×7 day matrix with month nav
Root `.calendar` (bare — wrap in a `.popover` for card chrome). Header: `.calendar__header` › `.calendar__nav-btn` + `.calendar__caption` (or `.calendar__dropdowns` › `.calendar__dropdown` for month/year selects). Grid: `.calendar__grid` of `.calendar__weekday` cells + `.calendar__day` buttons. Day states: `--today --selected --outside --disabled --hidden --focused --range-start --range-middle --range-end`. Optional `.calendar__footer` with `.calendar__link`. Range = two `.calendar` side by side.
```html
<div class="calendar">
  <div class="calendar__header">
    <button class="calendar__nav-btn" type="button" aria-label="Previous month"><svg data-lucide="chevron-left">…</svg></button>
    <div class="calendar__caption">June 2026</div>
    <button class="calendar__nav-btn" type="button" aria-label="Next month"><svg data-lucide="chevron-right">…</svg></button>
  </div>
  <div class="calendar__grid">
    <div class="calendar__weekday">Su</div>… <!-- 7 weekday cells -->
    <button class="calendar__day calendar__day--outside" type="button" data-outside>31</button>
    <button class="calendar__day calendar__day--today" type="button" data-day="1">1</button>
    <button class="calendar__day calendar__day--selected" type="button" data-day="15">15</button>
    … <!-- fill to a multiple of 7 -->
  </div>
</div>
```
