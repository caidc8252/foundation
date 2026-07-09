### stepper — numeric −/+ spinbutton (input-group composition)
Composition: `.input-group.stepper[role="group"]` shell owns border/focus ring; `.stepper__button` sizes the −/+ buttons; `.stepper__input` is the value control. Modifiers on the shell: `.input-group--disabled` `.input-group--invalid`. Addons: `.input-group__addon--inline-start / --inline-end`.
```html
<div class="input-group stepper" role="group" aria-label="Quantity">
  <div class="input-group__addon--inline-start">
    <button class="stepper__button btn btn--ghost btn--icon btn--xs" type="button" aria-label="Decrement" tabindex="-1">
      <svg data-lucide="minus">…</svg>
    </button>
  </div>
  <input class="input-group__control stepper__input" type="text" inputmode="numeric" role="spinbutton" aria-valuenow="5" aria-valuemin="0" aria-valuemax="10" aria-label="Quantity" value="5">
  <div class="input-group__addon--inline-end">
    <button class="stepper__button btn btn--ghost btn--icon btn--xs" type="button" aria-label="Increment" tabindex="-1">
      <svg data-lucide="plus">…</svg>
    </button>
  </div>
</div>
```
Disabled: `.input-group--disabled` on shell + `disabled` on both buttons and input. Invalid: `.input-group--invalid` on shell + `aria-invalid="true"` on input. Boundary buttons dim via `aria-disabled`.
