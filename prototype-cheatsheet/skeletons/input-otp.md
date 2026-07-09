### input-otp — segmented one-time-code / verification-code input
Slots: `.input-otp` shell wraps a visually-hidden real `<input>` + one or more `.input-otp__group`s of `.input-otp__slot`; active slot = `.input-otp__slot--active` holding `.input-otp__caret`; groups split by `.input-otp__separator`. States: `aria-invalid="true"` on slots (unified error ring), `aria-disabled="true"` on shell.
```html
<div class="input-otp">
  <input type="tel" maxlength="6" autocomplete="one-time-code" style="position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;">
  <div class="input-otp__group">
    <div class="input-otp__slot input-otp__slot--active"><span class="input-otp__caret"></span></div>
    <div class="input-otp__slot"></div>
    <div class="input-otp__slot"></div>
  </div>
  <span class="input-otp__separator" role="separator">–</span>
  <div class="input-otp__group">
    <div class="input-otp__slot"></div>
    <div class="input-otp__slot"></div>
    <div class="input-otp__slot"></div>
  </div>
</div>
```
