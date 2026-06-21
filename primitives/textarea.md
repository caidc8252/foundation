# Textarea

A multi-line text field. For free-form longer input — notes, descriptions, messages.

## Variants

Single visual variant. The only behavioral axis is `showCount` (character counter, see Anatomy). There are no size variants; height is auto-sizing.

| token recipe |
|---|
| bg `surface-2` · text `content-primary` (`text-sm`) · border `line-default` · padding `space-3` (12px) · placeholder `content-tertiary` · focus border `line-focus` + ring `line-focus`/30 |

## Sizes

No discrete size variants. The field is `min-h-16` (64px) and grows with content (`field-sizing-content`); the user can drag-resize vertically (`resize-y`). Width is full-bleed (`w-full`).

## States

- **focus-visible** — border `line-focus` + 2px ring `line-focus`/30.
- **disabled** — `cursor-not-allowed` + bg `surface-3` + `opacity-50`.
- **invalid** (`aria-invalid`) — border `error-strong` + 2px ring `error`/20.
- **counter near-limit** — at >=90% of `maxLength` the counter text shifts to `warning-strong`.
- **counter at-limit** — at `maxLength` the counter text shifts to `error-strong`.

## Anatomy

`textarea` — when `showCount` is set and `maxLength` is provided, a right-aligned counter (`count / maxLength`) renders below the field in `text-xs` `content-tertiary`, recoloring at the near/at-limit thresholds above. The counter tracks both controlled and uncontrolled values.

## Accessibility

- Real `<textarea>` semantics; pair with a `<Label htmlFor>` or wrap in `Field`.
- Error state must set `aria-invalid` so AT announces it.
- Focus ring is never removed, only restyled.

## Notes

- The character counter only renders when BOTH `showCount` and a `maxLength` are present; `showCount` alone shows a raw count with no denominator.
- No `inputSize`/`variant` props — unlike `Input`, this primitive is intentionally minimal.

## Implementations

- **Next / @cloud/ui** — `import { Textarea } from "@cloud/ui"`. Native `<textarea>` under the hood; props `showCount` plus standard textarea attrs (`maxLength`, `value`/`defaultValue`, `onChange`). API details: the `ui` skill.
- **Artifact (self-contained HTML)** — use the `.textarea` class in `./primitives.css`, on top of the inlined `dist/tokens.inline.css`. Same token recipe.
