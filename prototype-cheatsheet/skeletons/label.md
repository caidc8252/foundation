### label — caption for a form control
Modifiers: `.label--disabled`. Required marker: append `<span class="field__required" aria-hidden="true"> *</span>`. Associate via `for`/`id`.
```html
<label class="label" for="field-id">Full name<span class="field__required" aria-hidden="true"> *</span></label>
<input class="input" id="field-id" type="text" placeholder="…">
```
