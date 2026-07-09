### toggle-group — a set of press-toggle buttons acting as one control
Variants: `.toggle-group--outline/--segmented/--cloud/--plain`. Item sizes: `.toggle-group__item--sm/--md/--auto`. Select mode = container `data-type="single|multiple"` (independent of variant); multi adds `aria-multiselectable="true"`. Pressed item = `aria-pressed="true"`.
```html
<div class="toggle-group toggle-group--outline" role="group" data-type="single">
  <button class="toggle-group__item toggle-group__item--md" role="button" aria-pressed="true">List</button>
  <button class="toggle-group__item toggle-group__item--md" role="button" aria-pressed="false">Grid</button>
  <button class="toggle-group__item toggle-group__item--md" role="button" aria-pressed="false">Kanban</button>
</div>
```
