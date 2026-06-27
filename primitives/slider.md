# Slider

A draggable track-and-thumb input for selecting a numeric value, or a range (two thumbs) along a continuous scale.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> anatomy, the token recipe, states, a11y. It is the authority both
> implementations answer to. It deliberately does NOT document the React prop
> *types* or base-ui specifics (drag, keyboard stepping, value mapping,
> range/multi-thumb, orientation switching) — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Variants

Single visual variant. There is no `variant` prop — the only structural choice
is **orientation** (`horizontal` *(default)* / `vertical`) and **thumb count**
(one thumb = single value, two+ thumbs = range), both driven by base-ui data
attributes / value shape, not a styling variant.

| part | token recipe |
|---|---|
| track (rail) | bg `surface-3` · `radius-full` · thickness 6px (see notes) |
| indicator (filled range) | bg `primary` (= `primary-700`) · `radius-full` inherited from track |
| thumb | 14px circle (see notes) · `radius-full` · border `line-strong` · bg `surface-2` · `shadow-1` |

## Sizes

No size variants — fixed geometry. Track is 6px thick on its cross-axis and grows along the main axis (`w-full` horizontal / `h-full` vertical, vertical with a `min-h` floor of 160px = `calc(var(--space-20) * 2)`, see notes). The thumb is a fixed 14px circle. The hit target is enlarged by an invisible `--space-2` (8px) inset overlay around the thumb so the small circle stays easy to grab.

## States

- **hover / active (dragging)** — thumb gains a 2px ring in `primary` at 30% opacity (`ring-primary/30`); same ring on hover, on active (drag), and on focus-visible.
- **focus-visible** — thumb shows the same 2px `primary`/30 ring; the native outline is suppressed (ring replaces it). Note this is the slider's own ring recipe, *not* the shared `shadow-focus` token used by other controls.
- **disabled** — `cursor-not-allowed` + `opacity-50` on the whole control; the thumb independently honors `cursor-not-allowed` + `opacity-50` for both base-ui `data-disabled` and native `:disabled`.

## Anatomy

```
Root  ─ orientation owner (w-full horizontal / h-full vertical)
└─ Control  ─ flex, centers the track on the cross-axis; touch-none; owns disabled dim
   └─ Track  ─ the rounded rail (surface-3), grows along main axis, overflow-hidden
      └─ Indicator  ─ the filled portion from start to the (first) thumb (primary)
   └─ Thumb × N  ─ one circle per value; range = 2 thumbs, the indicator spans between
```

The indicator is clipped by the track (`overflow-hidden` + `radius-full`), so the filled range reads as a rounded sub-segment of the rail. Each value in the bound array renders one thumb; a single-value slider has one thumb anchored at the right edge of the indicator.

## Accessibility

- Real slider semantics from base-ui — arrow keys step the value, Home/End jump to min/max, `aria-valuemin`/`aria-valuemax`/`aria-valuenow`/`aria-orientation` are managed by the primitive.
- Each thumb is independently focusable and keyboard-operable (range sliders tab between thumbs).
- The focus ring (the `primary`/30 thumb ring) is never removed — the native outline is hidden only because the ring stands in for it.
- Provide an accessible name via `<Label htmlFor>` / `Field` or `aria-label`; the bare control has none.

## Notes

- **Off-grid geometry.** Track thickness (6px, source `h-1.5`/`w-1.5`) and thumb diameter (14px, source `size-3.5`) have no token in the scale (`--space-1`=4px, `--space-2`=8px; `--text-md`=14px is a *type* token, not a sizing one). The reference CSS pins them as literal px so the skin matches the implementation; **token-change wish**: a control-decoration sizing ramp (e.g. `--size-rail` / `--size-thumb`) would let these be tokenized. The vertical `min-h-40` floor is 160px = `calc(var(--space-20) * 2)` (no exact `--space-40` step exists; doubling `--space-20` keeps it token-only).
- **`bg-primary` → `primary-700`.** The implementation's `bg-primary` / `ring-primary` shadcn aliases resolve to the `primary-700` CTA color in this token system; the indicator fill and the thumb ring both use it.
- **Ring, not shadow-focus.** Unlike checkbox/radio/input (which use the `shadow-focus` token), the slider thumb expresses hover/active/focus with a 2px ring of `primary` at 30% opacity. The reference CSS reproduces this with `color-mix(... var(--color-primary-700) 30% ...)` rather than the shared focus token, to stay faithful to the source.
- **Behavior owned by the React implementation.** Drag, keyboard stepping, value→position mapping, range/multi-thumb layout, and orientation switching are base-ui's; the reference CSS expresses the static skin only (rail, fill, thumb, states).

## Artifact behavior (vanilla JS — paste, don't improvise)

The CSS above is a static skin; in a self-contained HTML artifact, wire it with this
progressive-enhancement snippet (CSP-safe, no deps). The skin renders without JS.

```js
(function () {
  // Thumb width in px — matches .slider__thumb { width: 14px }
  var THUMB_PX = 14;

  function syncSlider(root) {
    var input = root.querySelector('input[type="range"]');
    var indicator = root.querySelector('.slider__indicator');
    var thumb = root.querySelector('.slider__thumb');
    if (!input || !indicator || !thumb) return;

    function update() {
      var min = parseFloat(input.min) || 0;
      var max = parseFloat(input.max) || 100;
      var val = parseFloat(input.value) || 0;
      // Fraction in [0, 1]
      var pct = (val - min) / (max - min);
      var pctCss = (pct * 100).toFixed(4) + '%';

      // Fill the indicator from 0 to the thumb centre
      indicator.style.width = pctCss;

      // Place the thumb so its centre sits at pct along the track.
      // A naive "left: pct%" positions the thumb's LEFT EDGE at pct —
      // that reads ~7px too far right at all positions and is worst near
      // the ends (thumb overflows track). The correction below subtracts
      // the distance the left edge must retreat from centre:
      //   offset = pct × THUMB_PX   (the fraction of the thumb width
      //            that must be pulled back so the centre, not the edge,
      //            aligns with pct)
      // Result: left edge = pct% - (pct × THUMB_PX px)
      //         centre   = pct% - (pct × THUMB_PX px) + THUMB_PX/2 px ✓
      // At pct=0: left=0px (thumb flush left). At pct=1: left=100% - THUMB_PX px (flush right).
      thumb.style.left = 'calc(' + pctCss + ' - ' + (pct * THUMB_PX).toFixed(4) + 'px)';
    }

    input.addEventListener('input', update);
    update(); // initialise from the value already in the DOM
  }

  document.querySelectorAll('.slider').forEach(syncSlider);
})();
```

**Markup expected** (horizontal, single thumb):
```html
<div class="slider">
  <div class="slider__track">
    <div class="slider__indicator"></div>
  </div>
  <div class="slider__thumb"></div>
  <!-- native range sits on top, full width, opacity:0 or pointer capture -->
  <input type="range" min="0" max="100" value="30"
         style="position:absolute;inset:0;width:100%;opacity:0;cursor:pointer;">
</div>
```
The `.slider__thumb` must be `position:absolute` (or positioned relative to `.slider`) so `left` drives its horizontal position; the track's `overflow:hidden` clips the indicator automatically.

## Implementations

- **Next / @cloud/ui** — `import { Slider } from "@cloud/ui"`. base-ui `Slider` under the hood (`Root`/`Control`/`Track`/`Indicator`/`Thumb`); props include `value`/`defaultValue` (array — one entry per thumb), `min`/`max`, orientation via base-ui. API details: the `ui` skill. Do not re-skin via `className`.
- **Artifact (self-contained HTML)** — use `.slider` on the root with `.slider__track` · `.slider__indicator` · `.slider__thumb` elements, on top of the inlined `dist/tokens.inline.css`. Static-skin only: a self-contained artifact cannot reproduce drag/keyboard value mapping — set the indicator width and thumb offset inline to depict a chosen value. Same recipe: `surface-3` rail, `primary-700` fill, `surface-2` thumb with `line-strong` border + `shadow-1`, `primary`/30 ring on interaction.
