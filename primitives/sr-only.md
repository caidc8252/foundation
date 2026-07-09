# Screen-reader only

Visually hides text while keeping it in the accessibility tree.

## Anatomy

Apply `.sr-only` to a real text element that supplies an accessible name,
description, or label.

## Rules

- Use for icon-only controls, chart titles/descriptions, and visually hidden
  labels.
- Do not use for visible layout, spacing, or responsive hiding.
- Do not hide interactive controls with `.sr-only`; hide the text that names the
  visible control.

## Implementations

- **Artifact (self-contained HTML)** — `.sr-only` in `release/primitives.css`, on
  top of `release/tokens.inline.css`.
