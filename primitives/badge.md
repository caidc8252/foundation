# Badge

A small inline label for status or category. Non-interactive by default; can render as a link/element via `render`.

## Tones

Color is driven entirely by **`tone`** — there is no `variant` prop. Each tone maps to a semantic color pair.

| tone | token recipe |
|---|---|
| `neutral` *(default)* | bg `surface-3` · text `content-secondary` · border `line-default` |
| `success` | bg `success-bg` · text `success-strong` · border `success`/25 |
| `warning` | bg `warning-bg` · text `warning-strong` · border `warning`/25 |
| `error` | bg `error-bg` · text `error-strong` · border `error`/25 |
| `info` | bg `info-bg` · text `info-strong` · border `info`/25 |

## Shapes

| shape | result |
|---|---|
| `pill` *(default)* | radius `radius-full`, sans text |
| `tag` | radius `radius-sm`, monospace text (`font-mono`) |

## Sizes

No size prop — fixed height `h-5` (20px), `text-xs`, `font-medium`, `px-2`. Inline SVG icons are clamped to `size-3` (12px); padding tightens on the icon side via `has-data-[icon=inline-start]:pl-1.5` / `has-data-[icon=inline-end]:pr-1.5` when an icon adornment is present.

## States

- **focus-visible** (only when interactive via `render`) — `shadow-focus` ring.
- **hover** — only when rendered as an `<a>` (interactive); the base `<span>` is static.
- No disabled / invalid states — the badge is a presentational label.

## Anatomy

`[ dot? ] [ icon? ] children` — `dot` prefixes a 6px status dot in the current text color (`bg-current`), so it matches the tone and stays a shade darker than the badge bg. Icons are inline SVG slots clamped to 12px.

```
┌──────────────────────────────────┐
│ [●?] [icon?] label text         │   ← .badge + .badge--<tone>
└──────────────────────────────────┘
```

## Accessibility

- Default element is a `<span>` (non-interactive). If made actionable via `render` (e.g. an `<a>`), it gains the focus ring and hover; ensure it has an accessible name.
- Status conveyed by color alone is not accessible — keep the text label; `dot` is decorative (`aria-hidden`).

## Notes

- **Use `tone` for color — there is no `variant`.** The previous `variant` axis (`default`/`secondary`/`destructive`/`outline`/`ghost`/`link`) has been removed. CSS classes like `.badge--default` etc. remain in the stylesheet as compat stubs but are not part of the current API.
- **Semantic `tone` is for status / severity only.** Informational / category / plain-display fields (plan tier, type, category, a bare label) use `tone="neutral"` — never borrow a semantic tone (or a categorical color) to tint or distinguish a non-status field. (See `principles.md` §10.)
- `shape="tag"` switches to monospace + `radius-sm` — intended for code-like tokens/IDs, not prose labels.

## Implementations

- **Next / @cloud/ui** — `import { Badge } from "@cloud/ui"`. Renders a `<span>` (or any element via `render`); props `tone` `shape` `dot`. API details: the `ui` skill. Color is set entirely by `tone`; there is no `variant` prop.
- **Artifact (self-contained HTML)** — use `.badge` + `.badge--<tone>` (5 tones), optionally `.badge--tag` for the tag shape and `.badge__dot` for a leading status dot, in `./primitives.css`, on top of the inlined `dist/tokens.inline.css`. Same tonal recipe and names.
