### switch — binary on/off toggle for immediate state change
Modifiers: `.switch--sm`. Checked = `aria-checked="true"` + `data-checked`. `disabled` for locked. Always `role="switch"` on a `<button>` + one `.switch__thumb`.
```html
<button class="switch" role="switch" aria-checked="true" data-checked aria-label="Email alerts" type="button">
  <span class="switch__thumb"></span>
</button>
```
