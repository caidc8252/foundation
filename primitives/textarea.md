# Textarea

A multi-line text field. For free-form longer input — notes, descriptions, messages.

## Variants

Single visual variant. The only behavioral axis is `showCount` (character counter, see Anatomy). There are no size variants; height is auto-sizing.

| token recipe |
|---|
| bg `surface-2` · text `content-primary` (`text-md`) · border `line-default` · padding `space-3` (12px) · placeholder `content-tertiary` · focus border `line-focus` + `shadow-focus` ring |

## Sizes

No discrete size variants. The field is `min-h-16` (64px) and grows with content (`field-sizing-content`); the user can drag-resize vertically (`resize-y`). Width is full-bleed (`w-full`).

## States

- **focus-visible** — border `line-focus` + the `shadow-focus` ring (the one focus-ring token every control shares; it *is* `line-focus` at 25%).
- **disabled** — `cursor-not-allowed` + bg `surface-3` + `opacity-50`.
- **invalid** (`aria-invalid="true"`) — border `error-strong` + 2px ring `error`/20.
- **counter near-limit** — at >=90% of `maxLength` the counter takes `.textarea__count--warning` (text `warning-strong`).
- **counter at-limit** — at `maxLength` the counter takes `.textarea__count--error` (text `error-strong`).

## Anatomy

```
.textarea            the field itself
.textarea__count     right-aligned counter, a SIBLING below the field
```

When `showCount` is set and `maxLength` is provided, a right-aligned counter (`count / maxLength`) renders below the field in `text-xs` `content-tertiary` (tabular figures, so the count doesn't jitter as digits change), recoloring at the near/at-limit thresholds above. The counter tracks both controlled and uncontrolled values.

`.textarea__count` is a **sibling** of the `<textarea>`, not a child — a `<textarea>` cannot contain elements. It is the static skin only: the count text and which threshold modifier is applied are **behavior**, owned by the consumer.

## Accessibility

- Real `<textarea>` semantics; pair with a `<Label htmlFor>` or wrap in `Field`.
- Error state must set `aria-invalid` so AT announces it.
- Focus ring is never removed, only restyled.

## Notes

- The character counter only renders when BOTH `showCount` and a `maxLength` are present; `showCount` alone shows a raw count with no denominator.
- No `inputSize`/`variant` props — unlike `Input`, this primitive is intentionally minimal.

## Implementations

- **Next / @cloud/ui** — `import { Textarea } from "@cloud/ui"`. Native `<textarea>` under the hood; props `showCount` plus standard textarea attrs (`maxLength`, `value`/`defaultValue`, `onChange`). API details: the `ui` skill.
- **Artifact (self-contained HTML)** — use the `.textarea` class in `./primitives.css`, on top of the inlined `release/tokens.inline.css`. Same token recipe. For a counter, add a sibling `<div class="textarea__count">` after the field and swap `--warning` / `--error` onto it from your own script at the thresholds — the CSS paints the three resting appearances, it does not count characters. The invalid state is the `aria-invalid="true"` attribute, not a class.
