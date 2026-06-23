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
- **Distinguish the two empties.** *Nothing-yet* (cold start) → invite creation.
  *No-results-for-filters* → offer "clear filters", not "create". Don't show a
  create CTA when the user just over-filtered.
- Icon is decorative in a `surface-3` disc; title `text-lg`/600/`content-primary`;
  description `text-sm`/`content-tertiary`, capped to a readable measure.
- Lives **in place of table rows**, centered, with generous vertical breathing
  room (`space-16` block padding).

## Implementations

- **Next / @cloud/ui** — `Empty` (`title` / `description` / `action`). `ui` skill →
  data-display.
- **Artifact** — `.empty-state` › `.empty-state__icon` (svg) + `.empty-state__title`
  + `.empty-state__description` + `.empty-state__action` (a `.btn--primary`). In
  `composites.css`.
