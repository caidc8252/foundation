# Aspect Ratio

A layout box that locks its content to a fixed width:height ratio (16/9 video thumbnails, 1/1 avatars-in-cards, 4/3 media tiles). The box sets no width of its own (it inherits its width from flow / the call site); height is computed from the ratio.

## Variants

None. A single structural form with no visual skin — no surface, border, radius, shadow, color, or typography of its own. The only knob is the numeric `ratio` (a unitless number such as `16/9`, `4/3`, `1`), passed at the call site; it is data, not a variant. The box paints nothing itself; whatever you nest inside it (an `<img>`, a `.card`, a video) supplies the visible surface and clips to the box.

## Sizes

No size tokens. The box itself sets no width — it takes its width from normal flow / its parent, and its height is derived purely from `width ÷ ratio`. To size it, constrain the parent or set a `width` / `max-width` on the call site — not via this primitive.

## States

None. No hover / active / focus / disabled / invalid / selected — it is a non-interactive layout wrapper with no focusable behavior of its own. Any interactivity belongs to the content placed inside it.

## Anatomy

```
.aspect-ratio                 position: relative; aspect-ratio: var(--ratio)
└─ (child content)            <img> / video / .card / any block — fills + clips
```

A single positioned block. `position: relative` establishes a containing block so absolutely-positioned children (an overlay caption, a play button, a gradient scrim) anchor to the box. The ratio is carried by a `--ratio` custom property the call site sets, which the box consumes via `aspect-ratio: var(--ratio)`. Children typically take `width: 100%; height: 100%` (and `object-fit: cover` for images) to fill the locked frame.

## Accessibility

- Purely presentational `<div>` — no implicit role, not focusable, contributes no semantics. Correct: it is layout, not content.
- Any meaning lives in the child (`<img alt>`, a labelled control). The wrapper adds and removes nothing from the accessibility tree.

## Notes

- `aspect-ratio` is a native CSS property, not a Foundation token; the *value* (`--ratio`) is a unitless number supplied per call (conventionally exempt, like flex/grid integers). There is no `--aspect-*` token to reference and none is needed — this primitive intentionally holds zero color/size/radius tokens.
- The implementation's Tailwind `aspect-(--ratio)` arbitrary-property utility resolves to exactly `aspect-ratio: var(--ratio)`; `relative` resolves to `position: relative`. No other classes are applied by the primitive.

## Implementations

- **Next / @cloud/ui** — `import { AspectRatio } from "@cloud/ui"`. A plain `<div>` (no base-ui dependency); pass the required `ratio` number (e.g. `ratio={16/9}`); extra `className`/props pass through.
- **Artifact (self-contained HTML)** — wrap the content in `<div class="aspect-ratio" style="--ratio: 16/9">…</div>` styled by `./primitives.css`, on top of the inlined `release/tokens.inline.css`. Same recipe: `position: relative` + `aspect-ratio: var(--ratio)`. Set `--ratio` inline per use; the child fills the box.
