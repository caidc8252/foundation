### time-picker — a time-only field built on the native `<input type="time">`
No dedicated classes — composed from `field` + `input-group`: a clock `.input-group__addon--inline-start`, a `.input.input-group__control` (`--sm/--md/--lg`) of `type="time"`, and an optional trailing clear (`.input-group__addon--inline-end` › `.date-trigger__clear`). `disabled` on the input for the disabled state; omit `value` for empty.
```html
<div class="field">
  <label class="label" for="tp-1">Start time</label>
  <div class="input-group" role="group">
    <div class="input-group__addon input-group__addon--inline-start" aria-hidden="true">
      <svg data-lucide="clock">…</svg>
    </div>
    <input class="input input--md input-group__control" type="time" id="tp-1" value="09:30">
    <div class="input-group__addon input-group__addon--inline-end">
      <button class="date-trigger__clear" type="button" aria-label="Clear" tabindex="-1"><svg data-lucide="x">…</svg></button>
    </div>
  </div>
</div>
```
