# Switch

A binary on/off toggle for an immediate state change (enable/disable, light/dark). A pill track with a sliding thumb. Prefer `ToggleSwitch` when the control needs an inline label.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> size vocabulary, the token recipe, states, anatomy, a11y. It is the authority
> both implementations answer to. It deliberately does NOT document the React
> prop *types* or base-ui specifics — those live with the Next implementation
> (`@cloud/ui` + the `ui` skill). When the contract and an implementation
> disagree, the contract is right and the implementation is a bug.

## Variants

Single visual variant — a `radius-full` pill track with a circular thumb. There is no variant prop; the checked/unchecked *state* drives the track fill and thumb position, not a variant.

| state | track token recipe |
|---|---|
| unchecked | bg `line-strong` · hover bg `content-disabled` |
| checked | bg `primary` (CTA `primary-700`) · `shadow-cta` · hover bg `primary-600` |

The thumb is `surface-1` (the implementation's `bg-background`) in both states, sliding between the two ends.

## Sizes

| size | track (h × w) | thumb | checked travel |
|---|---|---|---|
| `default` *(default)* | 20 × 36px (`--space-5` × 36px) | 16px (`--space-4`) | 16px (`--space-4`) |
| `sm` | 14 × 24px (14px × `--space-6`) | 12px (`--space-3`) | 10px |

Travel = track width − thumb − 2× the 2px inset, so the thumb sits flush at both ends. The 36px / 14px track dims and the 10px sm travel have no exact `--space-*` token (see Notes).

## States

- **checked / unchecked** — track fill + thumb translate per the tables above; the transition animates `background-color` (track) and `transform` (thumb).
- **hover** — unchecked → `content-disabled`; checked → `primary-600`. (No hover surface change while disabled.)
- **focus-visible** — `shadow-focus` ring on the track. Never removed.
- **disabled** — `cursor-not-allowed` + `opacity-50`.
- **invalid** (`aria-invalid`) — track border `error` + 2px ring `error`/20.

## Anatomy

```
┌──────────────────────────┐
│ track  ( ● thumb )       │   unchecked → thumb left
└──────────────────────────┘
┌──────────────────────────┐
│         ( ● thumb )      │   checked  → thumb slid right (translate)
└──────────────────────────┘
```

Two slots: the pill **track** (root) and the circular **thumb**. The thumb is `pointer-events:none` — the whole track is the hit target, enlarged further by an invisible inset overlay (the implementation's `after:-inset-x-3 after:-inset-y-2`) so the small control is easy to click.

## Accessibility

- Real switch semantics from base-ui — `role="switch"`, `aria-checked`, space/enter toggles. Never a clickable `<div>`.
- The standalone switch has no label; provide one via `<Label htmlFor>` / `Field`, or use `ToggleSwitch` for an inline label.
- Focus ring (`shadow-focus`) is never removed.

## Notes

- **Token gaps (geometry).** The track width `36px` (default), the track height `14px` (sm), and the `10px` sm thumb travel have no `--space-*` token — they are switch-specific dimensions. The reference CSS uses the literal px for these three values; proposal: either accept them as component constants or add a switch sizing token group. The 20px height, both thumb diameters, and the 16px default travel DO map cleanly (`--space-5` / `--space-4` / `--space-3` / `--space-4`).
- **Token gap (thumb shadow).** The implementation gives the thumb a bespoke two-layer shadow (`0 1px 2px …/0.18, 0 0 0 0.5px …/0.08`) with no matching shadow token. `--shadow-1` is the nearest existing token and is what the reference CSS uses; proposal: a dedicated `--shadow-thumb` if exactness matters.
- The implementation's `bg-background` thumb maps to `surface-1`; `bg-primary` maps to the `primary-700` CTA color; `border-destructive` / `ring-destructive` map to `error`. The `dark:*` classes are theme overrides that resolve automatically via the flipped tokens — the reference layer needs no dark handling.

## Artifact behavior (vanilla JS — paste, don't improvise)

The CSS above is a static skin; in a self-contained HTML artifact, wire it with this
progressive-enhancement snippet (CSP-safe, no deps). The skin renders without JS.

```js
(function () {
  document.querySelectorAll('.switch').forEach(function (sw) {
    function isChecked() {
      return sw.getAttribute('aria-checked') === 'true' || sw.hasAttribute('data-checked');
    }

    function toggle() {
      if (sw.disabled || sw.getAttribute('aria-disabled') === 'true') return;
      var nowChecked = !isChecked();
      sw.setAttribute('aria-checked', String(nowChecked));
      if (nowChecked) {
        sw.setAttribute('data-checked', '');
      } else {
        sw.removeAttribute('data-checked');
      }
      // Fire a change-like event so surrounding code can react
      sw.dispatchEvent(new CustomEvent('switch:change', { bubbles: true, detail: { checked: nowChecked } }));
    }

    sw.addEventListener('click', toggle);

    sw.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    });

    // Ensure the element is keyboard-reachable if not already
    if (!sw.hasAttribute('tabindex') && sw.tagName !== 'BUTTON') {
      sw.setAttribute('tabindex', '0');
    }
    // role="switch" is required for a11y; set it if the consumer forgot
    if (!sw.getAttribute('role')) {
      sw.setAttribute('role', 'switch');
    }
  });
})();
```

**Markup expected:**
```html
<!-- unchecked -->
<button class="switch" role="switch" aria-checked="false" aria-label="Enable notifications">
  <span class="switch__thumb"></span>
</button>

<!-- checked (add data-checked OR aria-checked="true" — CSS keys on both) -->
<button class="switch" role="switch" aria-checked="true" data-checked aria-label="Enable notifications">
  <span class="switch__thumb"></span>
</button>
```
The CSS drives the track fill and thumb translate from `[aria-checked="true"]` / `[data-checked]`; no inline style needed.

## Implementations

- **Next / @cloud/ui** — `import { Switch } from "@cloud/ui"`. base-ui `Switch` (Root + Thumb) under the hood; prop `size` (`"sm" | "default"`). Toggle behavior (checked state, keyboard, `aria-checked`) is owned by the React/base-ui implementation; the contract and reference CSS express the static skin only. API details: the `ui` skill. For a labeled field use `ToggleSwitch`.
- **Artifact (self-contained HTML)** — use `.switch` (+ `.switch--sm`) on the track with a `.switch__thumb` child, toggled via a `[data-checked]` / `[aria-checked="true"]` attribute, on top of the inlined `release/tokens.inline.css`. Same fill recipe (`line-strong` ↔ `primary-700` + `shadow-cta`) and travel. There is no native HTML switch element, so the artifact drives state via the attribute rather than `:checked`.
