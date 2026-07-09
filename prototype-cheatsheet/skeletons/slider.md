### slider — draggable track-and-thumb numeric input
Modifiers: `.slider--disabled`, `.slider--vertical`. Slots: `.slider__track > .slider__indicator` (fill width %), `.slider__thumb` (positioned via `left`), and a visually-hidden `.range-input` (`type="range"`) that drives it.
```html
<div class="slider">
  <div class="slider__track">
    <div class="slider__indicator" style="width:60%;"></div>
  </div>
  <div class="slider__thumb" style="left:calc(60% - 1.4px);"></div>
  <input class="range-input" type="range" min="0" max="100" value="60" aria-label="Brightness">
</div>
```
