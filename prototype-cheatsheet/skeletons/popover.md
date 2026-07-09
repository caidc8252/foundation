### popover — small floating panel anchored to a trigger
Panel `.popover` with optional `.popover__header` (`.popover__title` + `.popover__description`) then arbitrary content or a stack of `.menu-item` rows (`.menu-item--destructive`). Placement/align live on the wrapper (`--top/--bottom/--left/--right`, `--start/--end`); panel toggles visibility (JS).
```html
<div class="popover-wrapper popover-wrapper--bottom popover-wrapper--start">
  <button class="popover-trigger" type="button" data-popover="pop-1">Info</button>
  <div class="popover-panel" id="pop-1" role="dialog" aria-label="Info">
    <div class="popover">
      <div class="popover__header">
        <h3 class="popover__title">Subscription details</h3>
        <p class="popover__description">Your current plan and billing.</p>
      </div>
      <div class="separator"></div>
      <div class="popover-content">…</div>
    </div>
  </div>
</div>
```
