### theme-toggle — icon-only ghost button that flips light/dark; lives in app chrome
`button.btn.btn--ghost.btn--icon.theme-toggle` (fixed 36px, no size prop; quieter resting color than a bare ghost icon button). Holds an 18px moon or sun glyph — the active glyph reflects the resolved theme, not CSS state. `aria-label` describes the target theme; optional `aria-pressed` + `data-live-indicator`.
```html
<!-- Light mode: shows moon → tap to go dark -->
<button type="button" class="btn btn--ghost btn--icon theme-toggle" aria-label="Switch to dark mode" aria-pressed="false" data-live-indicator>
  <svg data-lucide="moon" aria-hidden="true">…</svg>
</button>

<!-- Dark mode: shows sun → tap to go light -->
<button type="button" class="btn btn--ghost btn--icon theme-toggle" aria-label="Switch to light mode">
  <svg data-lucide="sun" aria-hidden="true">…</svg>
</button>
```
