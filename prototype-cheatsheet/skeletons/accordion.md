### accordion — vertical stack of collapsible disclosure sections
`.accordion` (`data-mode="single"` for exclusive-open) > `.accordion__item` (open = `--open`) each with `.accordion__trigger` (`aria-expanded`; `aria-disabled="true"` to disable) holding `.accordion__label` + `.accordion__arrow` (arrow position = DOM order; omit span for none) and `.accordion__content` panel.
```html
<div class="accordion">
  <div class="accordion__item accordion__item--open">
    <button class="accordion__trigger" aria-expanded="true" aria-controls="acc-1">
      <span class="accordion__label">Account settings</span>
      <span class="accordion__arrow" aria-hidden="true"><svg data-lucide="chevron-down">…</svg></span>
    </button>
    <div class="accordion__content" id="acc-1"><p>…</p></div>
  </div>
</div>
```
