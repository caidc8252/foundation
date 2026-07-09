# Empty state · composite

What a collection shows when it has nothing — a first-class state, not blank
space. Also covers no-results-for-filters and (with a different icon/verb) error.

> **Contract scope.** Cross-consumer contract: anatomy, the action rule, tokens.
> React prop types live with `@cloud/ui`; the contract wins.

## Anatomy

```
┌ empty-state ─────────────────────────────────┐
│                  ◍  (icon)                    │
│              No terminals yet                 │
│   Register your first terminal to start …     │
│              [ Register terminal ]            │
└───────────────────────────────────────────────┘
```

## Rules

- **The empty state invites the page's primary action** — same verb as the page
  header's primary button ("Register terminal"). A dead end with no next step is
  the failure mode this prevents.
- **The empty-state CTA is the only on-screen copy of that verb in its container,
  and the copy it echoes is the distant page header.** The duplicate reads fine on a
  list page only because the two sit far apart — page top vs. table body. If the
  empty state lives inside a card/section whose *own* header already carries that
  action (a card header, a wizard step card), do **not** render both: keep
  the action in the header **or** in the empty state, never both. The same verb in
  two buttons inches apart is the failure mode here.
- **Distinguish the two empties.** *Nothing-yet* (cold start) → invite creation.
  *No-results-for-filters* → offer "clear filters", not "create". Don't show a
  create CTA when the user just over-filtered.
- Icon is decorative in a `surface-3` disc; title `text-lg`/600/`content-primary`;
  description `text-md`/`content-tertiary`, capped to a readable measure.
- Lives **in place of table rows**, centered, with generous vertical breathing
  room (`space-16` block padding).

## Implementations

- **Next / @cloud/ui** — `Empty` (`title` / `description` / `action`). `ui` skill →
  data-display.
- **Artifact** — `.empty-state` › `.empty-state__icon` (svg) + `.empty-state__title`
  + `.empty-state__description` + `.empty-state__action` (a `.btn--primary` or
  `.btn--secondary`; use `primary` when this is the page's sole primary verb, `secondary`
  when a primary action already appears nearby or the context warrants lower visual weight).
  In `composites.css`.
