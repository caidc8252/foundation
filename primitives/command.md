# Command

A keyboard-driven command palette: a search input over a filtered, grouped list of runnable items. The `Command` shell renders standalone (embedded panel); `CommandDialog` mounts the same shell inside a centered modal popup.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> slot vocabulary, the token recipe, states, anatomy, a11y. It is the authority
> both implementations answer to. It deliberately does NOT document the React
> prop *types* or the `cmdk` / base-ui specifics — fuzzy filtering, the
> keyboard-roving `data-selected` highlight, the dialog open/close lifecycle,
> portalling, and focus trap all live with the Next implementation (`@cloud/ui` +
> the `ui` skill). When the contract and an implementation disagree, the contract
> is right and the implementation is a bug.

## Slots

Command is not a variant family — it is a fixed shell plus a set of structural slots. There is one visual shell; state (the active row, the empty result) drives appearance, not a variant prop.

| slot | role | token recipe |
|---|---|---|
| `Command` *(shell)* | the palette panel | bg `surface-2` · border `line-default` · radius `radius-xl` · `shadow-5` · text `content-primary` · `overflow-hidden`, column flex |
| `CommandDialog` | the shell inside a centered modal | backdrop `surface-overlay` + blur · popup bg `surface-2` · border `line-default` · radius `radius-xl` · `shadow-5`; pinned `top-1/3`, capped `max-w-[460px]` (no token — see notes) |
| `CommandInput` | the search field | wraps an `InputGroup` shell, chromeless (`border-0` save a bottom `line-subtle` hairline, transparent, `shadow-none`); leading `SearchIcon` addon · `text-sm` placeholder `content-tertiary` |
| `CommandList` | the scroll viewport | `max-h-72` (288px) · scroll-padding `space-1` · scrollbar hidden · `overflow-y-auto` |
| `CommandEmpty` | no-results message | centered, padded `space-6` block · `text-sm` |
| `CommandGroup` | a labeled section of items | padding `space-1`; heading uppercase `text-xs`, weight 500, tracked, `content-tertiary` |
| `CommandSeparator` | hairline between groups | 1px `line-default`, bleeds past the list padding |
| `CommandItem` | one runnable row | flex row · gap `space-2.5` · radius `radius-md` · px `cx-sm` · py `space-2` · `text-sm` · `content-primary`; leading icon slot + label + trailing check / shortcut |
| `CommandShortcut` | trailing keyboard hint on a row | `ml-auto` · `text-xs` · widely tracked · `content-tertiary` |

## States

States live on the row and the list, not on a variant axis:

- **selected / active** (`data-selected`) — the keyboard-roving highlight, the only "hover" a row gets: bg `surface-hover`. The skin can't observe live roving focus, so mark the highlighted row with `.command__item--active`.
- **disabled** (`data-disabled`) — `cursor-not-allowed` + `opacity-50`.
- **checked** (`data-checked`) — a trailing `CheckIcon` becomes visible (`opacity` 0→1). The check is hidden when the row carries a `CommandShortcut` (the shortcut and the check share the trailing slot; the shortcut wins).
- **input disabled** — `cursor-not-allowed` + `opacity-50` on the field.
- **empty** — when filtering yields nothing, `CommandEmpty` renders in place of the list rows.
- **focus** — focus lives on the always-mounted `CommandInput`; rows are navigated by arrow keys, not tab-focused. The list and items run `outline: none` (the input owns the visible focus ring via its `InputGroup` shell).

## Anatomy

```
Command  (shell: bordered, rounded-xl, shadow-5 surface; column)
├─ CommandInput      [ 🔍 search …                      ]  ← chromeless InputGroup, bottom hairline
└─ CommandList       (scroll viewport, max-h 288px)
   ├─ CommandGroup   "SUGGESTIONS"  ← uppercase tracked tertiary heading
   │  ├─ CommandItem  [ icon ] label …………………………… ⏎  ← trailing check OR shortcut
   │  └─ CommandItem  [ icon ] label …………………………… ⌘K
   ├─ CommandSeparator  ────────────────
   ├─ CommandGroup   "SETTINGS"
   │  └─ CommandItem  [ icon ] label
   └─ CommandEmpty   "No results found."   ← shown when the filter empties the list
```

`CommandDialog` wraps this whole shell in a portalled, backdrop-dimmed centered popup; the embedded `Command` omits the backdrop/popup and sits inline. Item icons default to 16px (`size-4`); an explicit `size-*` wins. The trailing slot holds the check glyph (checked rows) OR a `CommandShortcut` — never both.

## Accessibility

- `cmdk` provides combobox/listbox semantics: the input is `role="combobox"`, the list `role="listbox"`, each item `role="option"` with `aria-selected` tracking the roving highlight.
- Keyboard: typing filters; Up/Down move the highlight; Enter runs the highlighted item; Escape (in dialog) closes. Rows are not in the tab order — the input keeps focus.
- `CommandDialog` titles the modal via an `sr-only` `Dialog.Title` + `Description` (default "Command Palette" / "Search for a command to run…") so the dialog is announced even though they aren't shown.
- Focus ring is never removed — it rides the input's `InputGroup` shell.

## Implementations

- **Next / @cloud/ui** — `import { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator } from "@cloud/ui"`. **Behavior is owned by the React implementation** (`cmdk` for filtering + roving selection, base-ui `Dialog` for the modal); the reference CSS expresses the static skin only. `CommandInput` composes the `InputGroup` primitive. API details: the `ui` skill. Do not re-skin via `className`; the slots own the recipe.
- **Artifact (self-contained HTML)** — use `.command` shell with `.command__input` / `.command__list` / `.command__empty` / `.command__group` (heading `.command__group-heading`) / `.command__separator` / `.command__item` (`.command__item--active` for the highlighted row, `.command__shortcut` for the trailing hint), on top of the inlined `release/tokens.inline.css`. For the modal form add `.command-dialog__backdrop` + `.command-dialog` around the shell. The input row reuses the `.input-group` skin (chromeless, bottom hairline). Same token recipe, same names. Fuzzy filtering and the live `--active` roving are JS the artifact mocks statically.
