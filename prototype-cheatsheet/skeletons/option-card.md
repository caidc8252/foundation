### option-card — selectable card (radio/checkbox) with icon + title + description
Grid: `.option-grid` (add `role="radiogroup" aria-label` for single-select). Each `label.option-card` (modifiers `.option-card--radio` for radio dot; default = checkbox; `.option-card--selected` for the chosen state) = `input.option-card__input[type=radio|checkbox]` + `span.option-card__check` (checkbox holds a check svg; radio leaves it empty) + optional `span.option-card__icon` (svg tile) + `span.option-card__body` (`.option-card__title` + `.option-card__desc`).
```html
<div class="option-grid" role="radiogroup" aria-label="Account type">
  <label class="option-card option-card--radio option-card--selected">
    <input class="option-card__input" type="radio" name="account-type" value="isv" checked>
    <span class="option-card__check"></span>
    <span class="option-card__icon"><svg data-lucide="blocks">…</svg></span>
    <span class="option-card__body">
      <span class="option-card__title">ISV Partner</span>
      <span class="option-card__desc">Builds and lists apps on the marketplace…</span>
    </span>
  </label>
  …
</div>
```
Checkbox (multi-select): drop `--radio`, use `type="checkbox"`, and put a check svg inside `.option-card__check`. Icon is optional. Disabled: native `disabled` on the input.
