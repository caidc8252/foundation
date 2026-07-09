### tooltip — short text hint shown on hover/focus of a trigger
`.tooltip` bubble with side `--top/--bottom/--left/--right` + a `.tooltip__arrow`. Sits inside a `position:relative` wrapper beside the trigger; hidden until shown (JS toggles `.is-visible`). Optional inline `<kbd>` shortcut chip.
```html
<div class="tooltip-wrapper">
  <button class="demo-icon-btn" aria-label="Save">…</button>
  <div class="tooltip tooltip--bottom" role="tooltip">
    Save<kbd>Ctrl+S</kbd>
    <div class="tooltip__arrow"></div>
  </div>
</div>
```
