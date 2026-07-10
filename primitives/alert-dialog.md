# Alert Dialog

A forced-action confirm. A centered dialog that owns the screen until the user picks Cancel or Confirm — a destructive-or-consequential variant of `Modal` with no casual escape.

## Variants

One shell, no shell variant. The only choice is the **confirm action's** button variant — it borrows the [Button](./button.md) vocabulary:

| slot | default | use |
|---|---|---|
| confirm (`AlertDialogAction`) | `primary` | a benign-but-consequential confirm (Publish, Submit) |
| confirm, destructive | `danger` | a destructive confirm (Delete, Terminate) — the reason to reach for AlertDialog over Modal |
| cancel (`AlertDialogCancel`) | `ghost` | the safe escape; always present, always the secondary emphasis |

> Compat alias: the confirm slot's default variant is named `default` in the source (= Button's `primary`); pass `destructive` (= `danger`) for the dangerous path.

## Sizes

No size vocabulary — a single content-driven width. It floors to `calc(100% - 2rem)` on a narrow viewport and caps at `--spacing-dialog-confirm` (440px) on `sm`+ (one notch under `Modal`'s `md`/480px, because a confirm carries less than a form).

> The `2rem` mobile inset is viewport math, not token-expressible; left as calc (conventionally exempt).

## States

- **overlay (scrim)** — a fixed `surface-overlay` wash behind the panel, with a backdrop blur where supported. Unlike `Modal`, clicking it does **not** dismiss.
- **open / closed** — enter/exit is a fade + 95%→100% zoom on the panel and a fade on the scrim. Keyframes are impl-owned; this skin paints the resting OPEN panel only.
- **no dismiss affordance** — there is no close (×) button and neither Escape nor an overlay click closes the dialog. The user *must* pick an action. This is the defining behavioral difference from `Modal`, and it is impl-owned.
- The confirm/cancel buttons carry their own `.btn` hover / active / focus-visible / disabled states (see [Button](./button.md)). The shell itself has no disabled / invalid / selected state.

## Anatomy

```
┌ overlay (surface-overlay scrim, no dismiss) ──────────┐
│                                                       │
│   ┌ content (panel) ───────────────────────────────┐ │
│   │ ┌ header ──────────────────────────────────────┐ │
│   │ │ title                                        │ │
│   │ │ description (optional)                       │ │
│   │ └──────────────────────────────────────────────┘ │
│   │                                                  │
│   │ ┌ footer ──────────────────────────────────────┐ │
│   │ │                     [ Cancel ] [ Confirm ]   │ │
│   │ └──────────────────────────────────────────────┘ │
│   └──────────────────────────────────────────────────┘
└───────────────────────────────────────────────────────┘
```

- **content (panel)** — `surface-2` on `content-primary`, `radius-xl`, 1px `line-subtle` border, `shadow-4`. A vertical flex stack with `space-4` (16px) gap between header and footer; `space-6` (24px) padding. Centered via translate (viewport math). Deliberately mirrors `Modal`'s panel surface so both read as one dialog family.
- **header** — a `space-1.5` (6px) gap stack of title + optional description. Center-aligned on mobile, left-aligned on `sm`+ (no border or background of its own — the AlertDialog header is leaner than `Modal`'s).
- **title** — `text-md` / 600 / `content-primary`, tight leading. Required (it is the dialog's accessible name).
- **description** — `text-xs` / `content-secondary`, normal leading. Optional.
- **footer** — the action shelf; a `space-2` (8px) gap row, right-aligned on `sm`+. On mobile it stacks reversed (confirm on top) so the safe Cancel sits nearest the thumb. No border or fill — it sits flush in the panel padding (unlike `Modal`'s `surface-3` footer). Holds exactly two `.btn`s: a `ghost` Cancel and a `primary`/`danger` Confirm.

## Accessibility

- Real alert-dialog semantics from base-ui (role `alertdialog`, modal focus trap, `aria-labelledby`/`aria-describedby` wired to the title/description slots) — never a hand-rolled `div` overlay. `alertdialog` (vs `dialog`) tells AT this is an interruption that needs a decision.
- Focus moves into the panel on open and is restored to the trigger on close (impl-owned).
- **No dismissal shortcuts**: Escape and overlay-click do not close — the forced choice is the whole point. This is intentional, not a missing feature.
- Both actions are real `.btn`s with full keyboard/disabled semantics; the cancel slot must always be reachable and is the safe default.
- Focus rings (`shadow-focus`) are never removed.

## Notes

- The source paints the panel on `bg-popover` / `text-popover-foreground`; in this token system those resolve to `surface-2` / `content-primary` (same mapping `Modal`, `hover-card`, and `dropdown-menu` use). The scrim is `bg-surface-overlay` directly.
- The `440px` width cap is `--spacing-dialog-confirm`. The `calc(100% - 2rem)` mobile floor and the centering transform are viewport math, not token-expressible — left as calc/percent (conventionally exempt).
- The header's `gap-1.5` (6px) is a half-step over the raw `--space-1`/`--space-2`; expressed via `calc` like other 6px gaps in this stylesheet.
- Open/close animation, portalling, focus trap, and the deliberate suppression of Escape/overlay dismissal are **behavior owned by the React implementation**; the reference CSS expresses the static OPEN skin only. The artifact `.alert-dialog` block does not — and cannot — enforce the no-dismiss rule; it is a confirm-shaped shell whose visibility the consumer drives.

## Implementations

- **Next / @cloud/ui** — `import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@cloud/ui"`. base-ui `AlertDialog` under the hood; `AlertDialogAction` takes a `variant` (Button variant, default `default`/primary — pass `destructive` for the dangerous path), `AlertDialogCancel` is fixed to `ghost`. For a dismissible task or a form, use `Modal` instead.
- **Artifact (self-contained HTML)** — `.alert-dialog-overlay` wrapping `.alert-dialog`, with `.alert-dialog__header` › `.alert-dialog__title` + `.alert-dialog__description`, then `.alert-dialog__footer` holding two `.btn`s (`.btn .btn--ghost` Cancel + `.btn .btn--primary` or `.btn .btn--danger` Confirm). In `../primitives/primitives.css`, on top of the inlined `release/tokens.inline.css`. Same token recipe, same names. The skin renders the resting OPEN dialog; the consumer drives visibility. The no-dismiss rule is behavioral and lives with the React side.
