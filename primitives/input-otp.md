# InputOTP

A segmented one-time-code / verification-code input: a row of single-character slots the user types a PIN/OTP into, optionally split into groups by a separator.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> anatomy of the compound, the per-slot token recipe, slot states, the
> group-owned error treatment, a11y. It is the authority both implementations
> answer to. It deliberately does NOT document the React prop *types* or the
> `input-otp` library internals (slot activation, fake-caret rendering, focus
> traversal, `maxLength`/`pattern` handling) — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Variants

Single visual variant. There is no `variant` prop — the compound is a fixed
arrangement (container → group(s) of slots, optionally split by a separator),
and per-slot appearance is driven by *state* (active / filled / invalid),
not a variant. Each slot is a 40×48 box; the separator is a centered minus glyph.

## Sizes

No size variants — every slot is a fixed `40px` wide (`--space-10`) × `48px`
tall (`--space-12`) box with `text-xl` (18px) `font-mono` `font-semibold`
characters and `radius-md` corners. Slot count equals `maxLength` (one slot per
character); width comes from slot count, not a size prop.

## States

Per slot:

- **idle** — border `line-default` · bg `surface-2` · text `content-primary`.
- **active** (`data-active="true"`, the slot the caret is in) — border
  `primary-700` + `ring-2` ring `primary-700`/25; raised above neighbours
  (`z-index`) so the ring isn't clipped by the next slot's border.
- **filled** — same chrome as idle; the typed character renders in
  `content-primary` `font-mono`. A blinking fake caret (`16px`×`1px`,
  `content-primary`) shows in the active empty slot.

Group-level:

- **invalid** — the **group** (not the slot) owns the error skin: when any
  descendant slot is `aria-invalid`, the group draws one `error` border + a
  `ring-2` ring `error`/20 around the whole group. Individual slots never
  redraw their own invalid border — one slot's ring plus the group ring would
  double the validation outline. The active slot keeps its `primary-700`
  highlight inside an errored group so the caret position still reads.

Container-level:

- **disabled** — when the underlying control is disabled the whole container
  dims to `opacity-50` and slots are `cursor-not-allowed`.
- **focus-visible** — focus lives on the hidden real input owned by the React
  library; the *visible* focus signal is the active slot's `primary-700` ring,
  not a ring on each slot.

## Anatomy

```
.input-otp                      container — flex row, gap, dims when disabled
  .input-otp__group             a run of adjacent slots, rounded as a unit
    .input-otp__slot            one character cell (40×48)
      char                      typed character (content-primary, mono)
      .input-otp__caret         fake blinking caret (active empty slot only)
    .input-otp__slot  …         one per character
  .input-otp__separator         optional minus glyph between groups (role=separator)
  .input-otp__group  …          next group
```

Assemble it yourself: a container wraps one or more groups; each group holds one
slot per character (slot count = `maxLength`); put a separator between groups.
The error ring is drawn by the **group**, so wrap the slots that share one error
state in a single group.

## Accessibility

- Real input semantics come from the `input-otp` library: a single visually
  hidden `<input>` captures keystrokes; the slots are presentational mirrors of
  its characters. Keyboard entry, paste, caret movement, and focus are the
  library's job — the slots themselves are not focus targets.
- The separator carries `role="separator"` (decorative divider, not content).
- Validation is announced via `aria-invalid` on the slots; the visible error
  ring is the group's `:has(aria-invalid)` treatment.
- The visible focus indicator (active-slot ring) is never removed — it is the
  only on-screen cue for where the caret is.

## Notes

- The implementation's `border-destructive` / `ring-destructive` / `bg-foreground`
  classes are shadcn aliases; they resolve to `error` / `content-primary` in this
  token system.
- The fake caret's blink is owned by the React library's `animate-caret-blink`
  (`~1s`). The reference CSS expresses a static caret bar only — the artifact
  side does not reproduce the keystroke-driven caret/active logic.

## Implementations

- **Next / @cloud/ui** — `import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@cloud/ui"`. Compound built on the `input-otp` library (`OTPInput` + `OTPInputContext`); `InputOTP` takes `maxLength` / `value` / `onChange` (controlled, `onChange` returns the whole string) plus `pattern`. Slot activation, the fake caret, and focus traversal are owned by that library; the reference CSS expresses the static skin only. Presentation + per-slot entry only — no resend / countdown / auto-submit / validation. API details: the `ui` skill. Do not re-skin via `className`; the slot/group recipe is fixed.
- **Artifact (self-contained HTML)** — use `.input-otp` (container) › `.input-otp__group` › `.input-otp__slot` (with `.input-otp__slot--active` to show the active highlight and `.input-otp__caret` for the static caret), and `.input-otp__separator` between groups, on top of the inlined `dist/tokens.inline.css`. Mark error by adding `aria-invalid="true"` to a slot inside a group — the group's `:has()` rule draws the unified error ring. Same slot/active/error recipe, same token names.
