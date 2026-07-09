# Field

The form-row wrapper. Stacks a `Label` → control → hint/error caption, owns the required marker, and routes invalidity to a `role="alert"` error line.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> layout/anatomy, the token recipe, the hint↔error precedence, the invalid
> wiring, a11y. It is the authority both implementations answer to. It
> deliberately does NOT document the React prop *types* — those live with the
> Next implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Variants

Single structural variant — no variant prop. Field is a vertical flex stack, not a styled surface: it draws no border, background, or shadow of its own. It is pure layout plus the caption tones below.

| slot | token recipe |
|---|---|
| label | delegated to `Label` — font `font-sans` · `text-md` · weight 500 · tone `content-secondary` (the form-caption tone Field applies) |
| required marker `*` | `content` color `error`, decorative (`aria-hidden`) |
| hint | `text-xs` (12px) · tone `content-tertiary` — muted helper text |
| error | `text-xs` (12px) · tone `error` · `role="alert"` |

## Sizes

No size variants. The stack rhythm is fixed at `gap-2` (`--space-2`, 8px) between label, control, and the hint/error line. Caption text is `text-xs`; the label is `text-md` via the `Label` primitive. The control's own size (Input/Select/Textarea `sm`/`md`/`lg`) is chosen on the control, not on the field.

## States

Field itself has no hover/active/focus state — those belong to the control it wraps. Its only stateful behavior is the **hint ↔ error caption swap**:

- **default** — if `hint` is set and `error` is not, render the hint line (`content-tertiary`).
- **invalid** — when `error` is present it **replaces** the hint entirely (never both at once) and renders as an `error`-tone line with `role="alert"`. Field renders the error *text*; it does not set `aria-invalid` on the control — see Notes.
- **required** — when `required`, an `error`-colored ` *` is appended after the label text (decorative only).
- **disabled** — Field has no disabled prop; the wrapped control owns disabled. The `Label` dims via its own group/peer-disabled signals (see `label.md`).

## Anatomy

```
.field  (flex column, gap-2)
├─ Label (htmlFor → control id)        ← omitted entirely if no `label`
│   └─ caption text [ required * ]
├─ {children}                          ← the control: Input / Select / Textarea / group
└─ hint  OR  error                     ← exactly one, error wins; omitted if both empty
```

The label is rendered only when `label` is provided. `htmlFor` wires the label to the control's `id` for click-to-focus; **omit it for radio/checkbox groups**, which have no single target element. The error and hint are mutually exclusive — the error line wins and carries `role="alert"`.

## Accessibility

- `htmlFor` points the `Label` at the control `id`, making the caption a click-to-focus target. Omit it for groups (no single id) and let the group own its labelling.
- The required `*` is decorative (`aria-hidden`); requiredness reaches AT through the **control's** own `required` / `aria-required`, not the star.
- The error line is `role="alert"` so AT announces it when validation fails. For programmatic association, point the control's `aria-describedby` / `aria-errormessage` at the error line and set `aria-invalid` on the control — Field renders the message but does not own that wiring (see Notes).
- Field has no focus ring of its own; focus and validation rings live on the wrapped control.

## Notes

- **Invalid wiring is split.** Field renders the *error text* (red, `role="alert"`) and decides hint-vs-error precedence, but it does **not** set `aria-invalid` on the wrapped control or generate the `aria-describedby`/`aria-errormessage` linkage. The consumer sets `aria-invalid` on the control (which triggers the control's own invalid skin — see `input.md` / `select.md` / `checkbox.md`) and associates the message. The contract is: Field = caption + precedence; control = invalid state + a11y linkage.
- The reference `.field` skin and its caption sub-classes already exist in `primitives.css`; this contract documents them, it does not introduce new vocabulary.

## Implementations

- **Next / @cloud/ui** — `import { Field } from "@cloud/ui"`. A plain `<div>` wrapper (no base-ui dependency) composing the `Label` primitive; props `label` `hint` `error` `required` `htmlFor`. `error` takes precedence over `hint`; the error renders as `role="alert"`. Prop/API details: the `ui` skill. Do not hand-roll the label→control→hint stack — use `Field`.
- **Artifact (self-contained HTML)** — use `<div class="field">` with a `<label class="label">` (+ `.field__required` for the `*`) and a trailing `<p class="field__hint">` **or** `<p class="field__error">` in `../primitives/primitives.css`, on top of the inlined `release/tokens.inline.css`. Same `gap-2` rhythm and the same `content-tertiary` hint / `error` error tones. Render only one of hint/error. The control between them carries its own `aria-invalid` for the invalid skin.
