# Modal

A centered dialog over a dimmed scrim. The default container for a focused task — a form, a confirmation, a detail — that must own the screen until it's resolved.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> size vocabulary, the token recipe, states, anatomy, a11y. It is the authority
> both implementations answer to. It deliberately does NOT document the React
> prop *types* or base-ui specifics (open/close lifecycle, focus trap, portal,
> Escape/overlay dismissal, animation) — those live with the Next implementation
> (`@cloud/ui` + the `ui` skill). When the contract and an implementation
> disagree, the contract is right and the implementation is a bug.

## Sizes

Width presets only — height is content-driven and capped (see States · overflow). Every preset still floors to `calc(100% - 2rem)` on a narrow viewport.

| size | max-width | use |
|---|---|---|
| `sm` | 360px | a single confirm / a one-field prompt |
| `md` *(default)* | 480px | the standard form / detail dialog |
| `lg` | 640px | a wider form, side-by-side fields, a table |
| `xl` | 880px | a dense editor / multi-column layout |
| `fullscreen` | `100vw − 64px` × `100vh − 64px` | an immersive task; leaves a 32px frame on every side |

> The width presets are raw px (360/480/640/880) and the fullscreen frame is `64px` — no sizing token expresses popup dimensions yet (same gap noted in hover-card / dropdown-menu / command). See **Notes**.

### Choosing a width

A decision rule so the same content lands on the same width every time (a modal-specific reading of governance §15, *default to the md/default size*):

1. **Start at `md` (480px).** It is the default; most create/edit forms and detail dialogs belong here.
2. **Width tracks horizontal content shape — never height or importance.** The body scrolls (`max-height: 100vh − 96px`), so a tall form is never a reason to widen. Widen only when the content structurally needs the horizontal room (side-by-side columns, a table).
3. **Escalate one step at a time.** Don't jump to `xl` for a three-field form; if you are widening to reduce scrolling, stop — that is the wrong reason.
4. **A destructive confirm** → `sm`, and prefer an `AlertDialog` over a hardened Modal.

Map the content's shape to the width:

| content shape | width |
|---|---|
| a yes/no, or one field (confirm, delete, rename, single OTP) | `sm` |
| a single-column form (2–6 stacked fields) or plain detail text | `md` *(default)* |
| side-by-side fields, a short list/table, or a key–value record detail | `lg` |
| a dense multi-column form or data-heavy config | `xl` |
| an immersive sub-task that should own the screen (editor, builder, canvas) — a *mode*, not a dialog; use sparingly | `fullscreen` |

## States

- **overlay (scrim)** — a fixed `surface-overlay` wash behind the panel; an optional backdrop blur where supported. Clicking it dismisses (unless `closeOnOverlay` is off) — that gating is impl-owned.
- **open / closed** — enter/exit is a fade + 95%→100% zoom on the panel and a fade on the scrim. Keyframes are impl-owned; this skin paints the resting OPEN panel only.
- **body overflow** — the panel caps at `100vh − 96px`; the body slot scrolls while the header and footer stay pinned (both `shrink-0`).
- **close button hover** — `surface-hover` fill + text lifts `content-tertiary` → `content-primary`.
- **close button focus-visible** — `shadow-focus` ring.
- No disabled / invalid / selected states — those belong to the controls the modal contains, not the shell.

## Anatomy

```
┌ overlay (surface-overlay scrim) ──────────────────────┐
│                                                       │
│   ┌ modal (panel) ────────────────────────────────┐  │
│   │ ┌ header ────────────────────────────────────┐ │  │
│   │ │ ┌ heading ────────────────────────────┐ [×] │ │  │
│   │ │ │ title                                │    │ │  │
│   │ │ │ description (optional)               │    │ │  │
│   │ │ └──────────────────────────────────────┘    │ │  │
│   │ └────────────────────────────────────────────┘ │  │
│   │ ┌ body (scrolls) ────────────────────────────┐ │  │
│   │ │ children …                                 │ │  │
│   │ └────────────────────────────────────────────┘ │  │
│   │ ┌ footer (optional) ─────────────────────────┐ │  │
│   │ │                       [ Cancel ] [ Save ]  │ │  │
│   │ └────────────────────────────────────────────┘ │  │
│   └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

- **panel** — `surface-2` on `content-primary`, `radius-xl`, 1px `line-subtle` border, `shadow-1`, clipped (`overflow: hidden`) so slot edges meet the rounded corner.
- **header** — present only if there's a title, description, or close button. A row:
  `.modal__heading` (grouping title + description) on the left, close button pinned
  right, separated by a bottom `line-subtle` hairline.
- **heading** (`modal__heading`) — an intermediate wrapper inside `__header` that
  groups `__title` and `__description` into a vertical stack. This keeps the close
  button vertically centered with the text block when only a title is present, and
  lets the title+description pair flow naturally when both exist.
- **title** — `text-md` / 600 / `content-primary`, tight leading.
- **description** — `text-xs` / `content-secondary`, normal leading.
- **close** — a 24px `radius-md` `content-tertiary` icon button (×); hover recipe above. Behaves like a `ghost` button but is part of the modal shell, not a `.btn`.
- **body** — the scrolling region; `space-5` padding, `text-xs` / `content-secondary`. Rendered only when children are present.
- **footer** — the action shelf; `surface-3` ground, top `line-subtle` hairline. Stacks reversed on mobile, right-aligned row on `sm`+. Holds `.btn`s (typically a `ghost` cancel + a `primary` or `danger` confirm); for a destructive confirm prefer an `AlertDialog`.

## Accessibility

- Real dialog semantics from base-ui (role `dialog`, modal focus trap, `aria-labelledby`/`aria-describedby` wired to the title/description slots) — never a hand-rolled `div` overlay.
- Focus moves into the panel on open and is restored to the trigger on close (impl-owned).
- Escape and overlay-click dismissal are impl-owned and individually gateable (`closeOnEscape`, `closeOnOverlay`); a dialog that must survive a stray keypress sets these off, or uses `AlertDialog`.
- The close button needs an accessible name — the source ships an `sr-only` "Close".
- Focus rings (`shadow-focus`) are never removed.

## Notes

- The source paints on `bg-popover` / `text-popover-foreground` and the footer on `bg-muted`; in this token system those resolve to `surface-2` / `content-primary` and `surface-3` (same mapping the hover-card and dropdown-menu skins use).
- Size presets (360/480/640/880px) and the fullscreen 64px frame are raw px — token-change wish: a popup-width / dialog-size sizing scale (also wanted by hover-card, dropdown-menu, command). The reference CSS pins them as raw px and flags it inline.
- The panel max-height (`100vh − 96px`), the mobile width floor (`100% − 2rem`), and the centered transform are viewport math, not token-expressible; left as calc/percent (conventionally exempt).
- Open/close animation, portalling, focus trap, and dismissal gating are **behavior owned by the React implementation**; the reference CSS expresses the static OPEN skin only.

## Implementations

- **Next / @cloud/ui** — `import { Modal } from "@cloud/ui"`. base-ui `Dialog` under the hood; props `open` `onClose` `title` `description` `footer` `size` `showCloseButton` `closeOnOverlay` `closeOnEscape` `className`. Prop/API details: the `ui` skill. For a confirm that forbids casual dismissal, reach for `AlertDialog`, not a hardened `Modal`.
- **Artifact (self-contained HTML)** — `.modal-overlay` wrapping `.modal` (+ `.modal--<size>`), with `.modal__header` › `.modal__heading` (grouping `.modal__title` + `.modal__description`) + `.modal__close`, then `.modal__body`, then `.modal__footer` (holds `.btn`s). In `../primitives/primitives.css`, on top of the inlined `release/tokens.inline.css`. Same token recipe, same names. The skin renders the resting OPEN dialog; the consumer drives visibility.
