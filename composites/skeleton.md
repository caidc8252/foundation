# Skeleton · composite

The loading placeholder. A pulsing surface shape standing in for content that
hasn't arrived — preferred over a spinner for page/section/table loads because it
preserves layout and reduces perceived wait.

> **Contract scope.** Cross-consumer contract: the shape vocabulary, the motion
> rule, tokens. React prop types live with `@cloud/ui`; the contract wins.

## Shapes

| shape | stands in for |
|---|---|
| `line` | a row of metadata / a table cell |
| `text` | a line of body text |
| `title` | a heading (≈40% width) |
| `block` | a card / media area |
| `circle` | an avatar / icon |

A **table-loading scaffold** = stack `skeleton-row`s (each holding a few
`skeleton`s) inside a `.table-frame`, so the loading table occupies the same box
as the loaded one.

## Rules

- **Match the real layout** — a skeleton should sit where the content will, at the
  same size, so nothing jumps on load. Don't show a generic spinner for a known
  layout.
- **Motion is a slow opacity pulse** (`--duration-slow`, `--ease-standard`), color
  `surface-3`. No shimmer-sweep gradients (off-token, distracting).
- **Respects reduced motion** — the pulse is removed under
  `prefers-reduced-motion`.
- Don't over-skeleton: placeholder the *structure* (a few rows, a title, some
  lines), not every pixel.

## Implementations

- **Next / @cloud/ui** — use the team's loading affordances (Button `loading` for
  in-button spinners; skeleton/placeholder blocks for sections). `ui` skill →
  data-display.
- **Artifact** — `.skeleton` + `--line`/`--text`/`--title`/`--block`/`--circle`,
  and `.skeleton-row` for table loads. In `composites.css`.
