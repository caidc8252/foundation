### collapsible — single show/hide disclosure (one trigger, one panel)
Headless: consumers add chrome (e.g. `.collapsible--bordered`, or a `.btn` trigger). Modifiers: `.collapsible` `.collapsible--bordered` `.collapsible__trigger` `.collapsible__chevron` `.collapsible__chevron--open` `.collapsible__content` `.collapsible__content--open`. Open state = `data-panel-open` + `aria-expanded="true"` + `--open` on chevron & content.
```html
<div class="collapsible collapsible--bordered">
  <button class="collapsible__trigger" data-panel-open aria-expanded="true" aria-controls="col-1">
    <span>Open section</span>
    <span class="collapsible__chevron collapsible__chevron--open" aria-hidden="true">
      <svg data-lucide="chevron-down">…</svg>
    </span>
  </button>
  <div class="collapsible__content collapsible__content--open" id="col-1">
    <p>…</p>
  </div>
</div>
```
