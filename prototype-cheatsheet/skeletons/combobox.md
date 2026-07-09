### combobox — searchable single-select dropdown
Trigger `.combobox__trigger` (`--sm`; states `aria-disabled`/`aria-invalid`) with `.combobox__value` (`--placeholder`) + `.combobox__chevron`. Popup `.combobox__content` holds `.combobox__search` (`.combobox__input`) and `.combobox__list` of `.combobox__item` (`--highlighted`/`--selected`) each with `.combobox__item-indicator` check. Empty = `.combobox__empty`. Wrap in a `position:relative` element carrying `data-combobox`.
```html
<div class="combobox-wrapper" data-combobox>
  <div class="combobox__trigger" role="combobox" aria-expanded="false" aria-haspopup="listbox" tabindex="0">
    <span class="combobox__value combobox__value--placeholder">Select framework</span>
    <svg class="combobox__chevron" data-lucide="chevron-down">…</svg>
  </div>
  <div class="combobox__content" role="listbox">
    <div class="combobox__search">
      <svg data-lucide="search">…</svg>
      <input class="combobox__input" type="text" placeholder="Filter…">
    </div>
    <div class="combobox__list">
      <div class="combobox__item" role="option" aria-selected="false" data-value="React">
        <span>React</span>
        <span class="combobox__item-indicator" aria-hidden="true"><svg data-lucide="check">…</svg></span>
      </div>
    </div>
  </div>
</div>
```
