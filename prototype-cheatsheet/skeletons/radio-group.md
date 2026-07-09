### radio-group — mutually exclusive options (exactly one selected)
`.radio` (native `type="radio"`; shared `name` = single-select). States: `checked`, `disabled`, `aria-invalid="true"`. No group class — wrap in a `display:grid`/`flex` container.
```html
<div style="display:grid;gap:var(--space-2);">
  <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;">
    <input type="radio" name="plan" class="radio" value="free"> Free plan
  </label>
  <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;">
    <input type="radio" name="plan" class="radio" value="pro" checked> Pro plan
  </label>
</div>
```
