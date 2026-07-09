### field — form-row wrapper (label → control → hint/error)
`.field __required __hint __error`. Invalid: control gets `aria-invalid="true"`, error replaces hint.
```html
<div class="field">
  <label class="label" for="f1">Email<span class="field__required" aria-hidden="true"> *</span></label>
  <input class="input" id="f1" type="email" required placeholder="…">
  <p class="field__hint">…</p>
  <p class="field__error" role="alert">…</p>
</div>
```
