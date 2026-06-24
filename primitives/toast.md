# Toast

A transient, auto-dismissing notification (sonner). Fired imperatively from anywhere via `toast()` to confirm an action, surface a background result, or report an error — never to ask a question (that's a dialog).

> **Contract scope.** This file is the cross-consumer *design contract*: the
> tone vocabulary, the token recipe, anatomy, position, a11y. It is the authority
> both implementations answer to. It deliberately does NOT document the React
> prop *types* or sonner specifics — those live with the Next implementation
> (`@cloud/ui` + the `ui` skill). When the contract and an implementation
> disagree, the contract is right and the implementation is a bug.

## Tones

One neutral surface in every tone — the toast card is always `surface-2` / `content-primary` text on a `line-default` hairline. The **tone lives in the leading icon only** (default sonner, no `richColors`): the surface never tints. Tone is chosen by which `toast.*` method fires, not a variant prop.

| tone | fired by | leading icon recipe |
|---|---|---|
| `default` *(neutral)* | `toast(msg)` | no icon (title + optional description only) |
| `success` | `toast.success` | check-circle glyph · `success` |
| `info` | `toast.info` | info glyph · `info` |
| `warning` | `toast.warning` | triangle-alert glyph · `warning` |
| `error` | `toast.error` | octagon-x glyph · `error` |
| `loading` | `toast.loading` | spinner glyph · `content-tertiary` · skips the countdown bar (non-finite duration) |

## Anatomy

```
┌ toast (340px, surface-2) ──────────────────── [×] ┐
│ ◍  Title                                          │
│    Optional description                           │
└═══════════════════════════════════════════════════┘
  ▔▔▔▔▔▔▔▔  countdown bar (primary-400, drains L→R)
```

`[ icon? ] · content( title + description? ) · [ close? ]` — the icon and content top-align (`items-start`). The icon is a 14px tone glyph in a `shrink-0` slot. The content column stacks `title` (`text-xs`/500/`content-primary`) over an optional `description` (`text-xs`/`content-tertiary`), tight `space-1` gap. The optional close button is a borderless `content-tertiary` glyph at the top-right. A 2px `primary-400` **countdown bar** is pinned to the bottom edge and drains left→right over the toast's real duration; it pauses while the toast region is hovered, and is absent for non-finite (loading) durations.

## Sizes

No size variants. Fixed `340px` width (raw px — no sizing token expresses popup/toast width yet; see notes). Height is content-driven. Default auto-dismiss is 2500ms (a deployment constant owned by the implementation, not a token).

## States

- **resting / stacked** — toasts stack at the configured corner; sonner collapses the stack until hovered (behavior owned by impl).
- **region hover** — every visible toast's countdown bar pauses together (matches sonner pausing all timers on region hover).
- **close hover** — close glyph goes `content-tertiary` → `content-primary`.
- **error hover affordance** — the error toast reveals a hover-to-show icon copy button pinned top-right (a `ghost`/`icon-xs` `.btn`); positioning + reveal are skin, the copy action is impl behavior.

## Position

Container-level, not per-toast: the `Toaster` is placed once in the root layout and accepts a `position` (sonner default `bottom-right`; any corner/`top-center` etc. is allowed). Theme auto-tracks the app light/dark preference, so the surface flips via tokens. There is no static CSS for placement here — the corner is a Toaster prop owned by the implementation.

## Accessibility

- Toasts render in an `aria-live` region (polite for default/success/info, assertive for error) — owned by sonner; consumers don't hand-roll it.
- A toast is supplementary, never the only channel for a critical result — pair an error toast with an inline message where the action lives.
- The close affordance is a real `<button>` with an accessible name.
- Focus is not stolen on show; keyboard users reach toasts via sonner's region hotkey.

## Implementations

- **Next / @cloud/ui** — `import { Toaster, toast } from "@cloud/ui"`. Mount `<Toaster />` once in the root layout; call `toast()` / `toast.success|info|warning|error|loading|promise` anywhere. Built on `sonner`; **all show/stack/dismiss/position/aria-live/timer behavior is owned by the React implementation** — the reference CSS below expresses the static toast *skin* only (surface, border, radius, shadow, spacing, type, tone icon color, countdown bar). API details: the `ui` skill.
- **Artifact (self-contained HTML)** — render one resting toast with `.toast` (add `.toast--with-icon` when a leading glyph is present), inner `.toast__icon` + `.toast__content` ( `.toast__title` + `.toast__description` ) + optional `.toast__close`. Tone via `.toast__icon--success|info|warning|error|loading`. The countdown bar is the `.toast--countdown::after` element, fed by a `--toast-duration` custom property on the toast. On top of the inlined `dist/tokens.inline.css`. Same neutral-surface / tone-icon recipe.
