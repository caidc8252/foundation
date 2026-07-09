### object-tile — square filled entity/object identity mark (company, app, device model)
`.object-tile` + size `--sm/--md/--lg` + color `--neutral` or `--cat-1…--cat-6`. Content is either short initials/label text directly, or a glyph wrapped in `.object-tile__icon`. Decorative → `aria-hidden="true"`.
```html
<div class="object-tile object-tile--md object-tile--cat-1" aria-hidden="true">AC</div>

<div class="object-tile object-tile--md object-tile--neutral" aria-hidden="true">
  <span class="object-tile__icon"><svg data-lucide="image">…</svg></span>
</div>
```
