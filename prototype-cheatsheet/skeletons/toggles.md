### toggles — inline control-with-label wrappers (checkbox / radio / switch)
Three flex wrappers, each pairing a primitive with a clickable `.label`. Disabled via `data-disabled="true"` on the wrapper.
```html
<!-- .toggle-checkbox — multi-select / boolean opt-in -->
<label class="toggle-checkbox">
  <input type="checkbox" class="checkbox" checked />
  <span class="label">Enable email notifications</span>
</label>

<!-- .toggle-radio — single-select; group inside fieldset/legend + .toggle-radio-group -->
<fieldset>
  <legend>Shipping method</legend>
  <div class="toggle-radio-group">
    <label class="toggle-radio">
      <input type="radio" class="radio" name="shipping" value="standard" checked />
      <span class="label">Standard (5–7 business days)</span>
    </label>
    …
  </div>
</fieldset>

<!-- .toggle-switch — binary on/off -->
<label class="toggle-switch">
  <span class="switch" role="switch" aria-checked="true" data-checked tabindex="0"><span class="switch__thumb"></span></span>
  <span class="label">Wi-Fi</span>
</label>
```
Disabled example: `<label class="toggle-switch" data-disabled="true">` with `aria-disabled="true" tabindex="-1"` on the switch (and `disabled` on native checkbox/radio inputs).
