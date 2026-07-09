### scroll-area — styled overflow container swapping the OS scrollbar for a thin token-skinned one
Root `.scroll-area` (set a bounding height/width) wrapping a focusable `.scroll-area__viewport` (`tabindex="0"`) that holds the scrolling content; for horizontal overflow set `white-space:nowrap` on the viewport. The skinned bar `.scroll-area__scrollbar` › `.scroll-area__thumb` is the styled-scrollbar hook (JS-driven; omit for a plain instance).
```html
<div class="scroll-area" style="height:200px;">
  <div class="scroll-area__viewport" tabindex="0">
    <div>Account settings</div>
    <div>Billing &amp; plans</div>
    … <!-- overflowing content -->
  </div>
</div>
```
