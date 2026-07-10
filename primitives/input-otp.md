# InputOTP

A segmented one-time-code / verification-code input: a row of single-character slots the user types a PIN/OTP into, optionally split into groups by a separator.

## Variants

Single visual variant. There is no `variant` prop — the compound is a fixed
arrangement (container → group(s) of slots, optionally split by a separator),
and per-slot appearance is driven by *state* (active / filled / invalid),
not a variant. Each slot is a 40×48 box; the separator is a centered minus glyph.

## Sizes

No size variants — every slot is a fixed `40px` wide (`--space-10`) × `48px`
tall (`--space-12`) box with `text-xl` (18px) `tabular-nums` `font-semibold`
characters and `radius-md` corners. Slot count equals `maxLength` (one slot per
character); width comes from slot count, not a size prop.

## States

Per slot:

- **idle** — border `line-default` · bg `surface-2` · text `content-primary`.
- **active** (`data-active="true"`, the slot the caret is in) — border
  `primary-700` + `ring-2` ring `primary-700`/25; raised above neighbours
  (`z-index`) so the ring isn't clipped by the next slot's border.
- **filled** — same chrome as idle; the typed character renders in
  `content-primary` `tabular-nums`. A blinking fake caret (`16px`×`1px`,
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
  .input-otp__group             a run of slots, each its own rounded box, spaced by a gap; error ring wraps the run
    .input-otp__slot            one character cell (40×48)
      char                      typed character (content-primary, tabular)
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

## Artifact behavior (vanilla JS — paste, don't improvise)

The CSS above is a static skin; in a self-contained HTML artifact, wire it with this
progressive-enhancement snippet (CSP-safe, no deps). The skin renders without JS.

```js
(function () {
  // Note: .input-otp and .input-otp:focus-visible already have outline:none in CSS —
  // no JS suppression needed. The visible focus signal is the active slot's ring.

  document.querySelectorAll('.input-otp').forEach(function (root) {
    var slots = Array.from(root.querySelectorAll('.input-otp__slot'));
    if (!slots.length) return;

    // One hidden real <input> captures all keystrokes for the whole component.
    var realInput = root.querySelector('input[type="text"],input[type="tel"],input[type="number"]');
    if (!realInput) return;

    var maxLen = slots.length;

    function render(val) {
      var chars = val.split('');
      var cursor = Math.min(chars.length, maxLen - 1); // active slot index
      slots.forEach(function (slot, i) {
        // Clear slot
        slot.classList.remove('input-otp__slot--active');
        var caret = slot.querySelector('.input-otp__caret');
        if (caret) caret.remove();
        // Set character text (preserve other child nodes if any)
        var textNode = slot.childNodes[0];
        var ch = chars[i] || '';
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          textNode.textContent = ch;
        } else {
          slot.insertBefore(document.createTextNode(ch), slot.firstChild);
        }
        // Active slot = next empty slot (or last slot when full)
        if (i === cursor && chars.length < maxLen) {
          slot.classList.add('input-otp__slot--active');
          // Add caret only when slot is empty
          if (!ch) {
            var c = document.createElement('span');
            c.className = 'input-otp__caret';
            slot.appendChild(c);
          }
        }
      });
    }

    realInput.addEventListener('input', function () {
      // Clamp to maxLen and digits/letters only (adjust pattern as needed)
      var val = realInput.value.slice(0, maxLen);
      realInput.value = val;
      render(val);
    });

    realInput.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace') {
        var val = realInput.value;
        realInput.value = val.slice(0, -1);
        render(realInput.value);
      }
    });

    // Paste: strip non-alphanumeric, trim to maxLen
    realInput.addEventListener('paste', function (e) {
      e.preventDefault();
      var pasted = (e.clipboardData || window.clipboardData).getData('text');
      var val = pasted.replace(/\s/g, '').slice(0, maxLen);
      realInput.value = val;
      render(val);
    });

    // Click on any slot focuses the real input
    slots.forEach(function (slot) {
      slot.addEventListener('click', function () { realInput.focus(); });
    });

    // Initial render from pre-filled value (e.g. SSR snapshot)
    render(realInput.value || '');
  });
})();
```

**Markup expected:**
```html
<div class="input-otp">
  <!-- hidden real input — focus target; outline:none already in CSS -->
  <input type="tel" maxlength="6" autocomplete="one-time-code"
         style="position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;">
  <div class="input-otp__group">
    <div class="input-otp__slot input-otp__slot--active">
      <span class="input-otp__caret"></span>
    </div>
    <div class="input-otp__slot"></div>
    <div class="input-otp__slot"></div>
  </div>
  <span class="input-otp__separator" role="separator">–</span>
  <div class="input-otp__group">
    <div class="input-otp__slot"></div>
    <div class="input-otp__slot"></div>
    <div class="input-otp__slot"></div>
  </div>
</div>
```

## Implementations

- **Next / @cloud/ui** — `import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@cloud/ui"`. Compound built on the `input-otp` library (`OTPInput` + `OTPInputContext`); `InputOTP` takes `maxLength` / `value` / `onChange` (controlled, `onChange` returns the whole string) plus `pattern`. Slot activation, the fake caret, and focus traversal are owned by that library; the reference CSS expresses the static skin only. Presentation + per-slot entry only — no resend / countdown / auto-submit / validation. Do not re-skin via `className`; the slot/group recipe is fixed.
- **Artifact (self-contained HTML)** — use `.input-otp` (container) › `.input-otp__group` › `.input-otp__slot` (with `.input-otp__slot--active` to show the active highlight and `.input-otp__caret` for the static caret), and `.input-otp__separator` between groups, on top of the inlined `release/tokens.inline.css`. Mark error by adding `aria-invalid="true"` to a slot inside a group — the group's `:has()` rule draws the unified error ring. Same slot/active/error recipe, same token names.
