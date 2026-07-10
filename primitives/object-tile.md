# Object Tile

Square, filled entity/object identity mark for companies, apps, device models, etc. Shows a glyph icon, name-derived initials, or a short code on a neutral avatar surface or a categorical content-hashed tint. Always square + `radius-lg` (12px). Consolidates the older InitialsTile + ColorTile primitives.

> **Distinct from Avatar.** `Avatar` is a circular profile picture with an image + caller-supplied fallback. `ObjectTile` is a square surface with no image — it renders its own content. Use Avatar for round profile pictures, ObjectTile for square brand/object marks.

## Variants

Two orthogonal axes:

**Content mode** (exactly one of):

| mode | content |
|---|---|
| icon | a glyph node (~20px at md) centered as-is |
| name | first letters of first two words via `initialsFromName` |
| label | a short code shown whole (fluid font so multi-char codes fit) |

**Tone** (`tone`):

| tone | surface | text | border |
|---|---|---|---|
| `neutral` *(default)* | `avatar-bg` | `avatar-fg` | `line-subtle` |
| `auto` | categorical `cat-N` (content-hashed) | `cat-N-fg` | `cat-line` |

The `auto` tone hashes the content seed (defaults to `name ?? label`) to one of `cat-1..6`.

## Sizes

| size | width/height | icon | initials/label font |
|---|---|---|---|
| `sm` | 32px (`space-8`) | 16px (`space-4`) | `text-xs` |
| `md` *(default)* | 40px (`space-10`) | 20px (`space-5`) | `text-md` |
| `lg` | 48px (`space-12`) | 24px (`space-6`) | `text-lg` |

All sizes use `radius-lg` (12px). Label mode uses a fluid font (`clamp(0.5rem, 28cqw, 2rem)`) to keep multi-char codes whole — the artifact reference uses a fixed step per size instead.

## States

Static only — no interactive state. `aria-hidden` by design; the tile mirrors text already rendered accessibly nearby.

## Anatomy

```
┌ object-tile ─────┐   ← square, radius-lg, tone surface + border
│                  │
│    AC  /  ◍  /  │   ← initials  /  icon slot  /  label text
│    code          │
└──────────────────┘
```

## Accessibility

`aria-hidden="true"` — decorative. The tile mirrors text the consumer already renders accessibly nearby (e.g. the row's visible name). Do not place interactive content inside.

## Notes

- Use `colorSeed` to override which text drives the categorical hash when the displayed label differs from the identity key (e.g. a localized display name vs. an internal code).
- `color-tile` and `initials-tile` contracts have been removed; use `object-tile` for all new work.

## Implementations

- **Next / @cloud/ui** — `import { ObjectTile } from "@cloud/ui"`. Props: `icon` `name` `label` `tone` `colorSeed` `size` `className`.
- **Artifact (self-contained HTML)** — `.object-tile` + size modifier `.object-tile--sm|md|lg` + tone modifier `.object-tile--neutral` or `.object-tile--cat-1..6`; optional `.object-tile__icon` wrapper for glyph mode. In `primitives/primitives.css` on top of `release/tokens.inline.css`.
