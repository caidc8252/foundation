# Badge

A small inline label for status or category. Non-interactive by default; can render as a link/element via `render`.

## Variants

Two axes drive a badge: a low-level **`variant`** (visual style) and a high-level **`tone`** (semantic status). Prefer `tone` for status indicators; reach for `variant` only for non-semantic chrome.

### `tone` (preferred for status)

| tone | token recipe |
|---|---|
| `neutral` | bg `surface-3` · text `content-secondary` · border `line-default` |
| `success` | bg `success-bg` · text `success-strong` · border `success`/25 |
| `warning` | bg `warning-bg` · text `warning-strong` · border `warning`/25 |
| `error` | bg `error-bg` · text `error-strong` · border `error`/25 |
| `info` | bg `info-bg` · text `info-strong` · border `info`/25 |

### `variant` (low-level)

| variant | use | token recipe |
|---|---|---|
| `default` *(default)* | solid emphasis chip | bg `primary-700` · text `content-on-primary` |
| `secondary` | neutral filled chip | bg `surface-3` · text `content-secondary` |
| `destructive` | error-tinted chip | bg `error`/10 · text `error` |
| `outline` | bordered, transparent | border `line-default` · text `content-primary` |
| `ghost` | no chrome until hover | hover bg `surface-hover` + text `content-primary` |
| `link` | text styled as link | text `primary-700` · hover underline |

`tone` is resolved on top of `variant`: setting `tone` picks a base `variant` and then overlays the tonal color recipe, so the tonal tables above win. Setting `variant` explicitly overrides `tone`'s base.

## Shapes

| shape | result |
|---|---|
| `pill` *(default)* | radius `radius-full`, sans text |
| `tag` | radius `radius-sm`, monospace text (`font-mono`) |

## Sizes

No size prop — fixed height `h-5` (20px), `text-xs`, `font-medium`, `px-2`. Inline SVG icons are clamped to `size-3`; padding tightens on the icon side (`pr-1.5`/`pl-1.5`) when an icon adornment is present.

## States

- **focus-visible** (only when interactive via `render`) — border `line-focus` + ring.
- **hover** — only the `ghost`/`outline`/`link`/solid variants define a hover (and only when rendered as an `<a>`); tonal badges are static.
- **invalid** (`aria-invalid`) — destructive border + ring.

## Anatomy

`[ dot? ] [ iconLeft? ] children [ iconRight? ]` — `dot` prefixes a 6px status dot in the current text color (`bg-current`), so it matches the tone and stays a shade darker than the badge bg. Icons are inline SVG slots clamped to 12px.

## Accessibility

- Default element is a `<span>` (non-interactive). If you make it actionable via `render` (e.g. an `<a>`), it gains the focus ring and hover; ensure it has an accessible name.
- Status conveyed by color alone is not accessible — keep the text label; `dot` is decorative (`aria-hidden`).

## Notes

- **Use `tone`, not `variant`, for status** (order state, health, severity). `variant` is for non-semantic chrome and compat. The two interact: `tone` selects a base variant via an internal map (`neutral→secondary`, `success→default`, `warning→outline`, `error→destructive`, `info→secondary`) then overlays its own colors.
- `shape="tag"` switches to monospace + `radius-sm` — intended for code-like tokens/IDs, not prose labels.
- The implementation's `bg-primary` / `text-primary-foreground` / `text-destructive` are shadcn aliases mapping to `primary-700` / `content-on-primary` / `error` in this token system.

## Implementations

- **Next / @cloud/ui** — `import { Badge } from "@cloud/ui"`. Renders a `<span>` (or any element via `render`); props `tone` `variant` `shape` `dot`. API details: the `ui` skill. Prefer `tone` for status.
- **Artifact (self-contained HTML)** — use `.badge` + a tone/variant modifier in `./primitives.css`, on top of the inlined `dist/tokens.inline.css`. Same tonal recipe and names.
