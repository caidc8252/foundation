### list-row — hairline-separated row: leading media · main · trailing control
Container: `.list-rows` (usually inside `.card > .card__content.card__content--flush`). Each `.list-row` (modifier `.list-row--disabled`) = leading `.list-row__icon` (or an `.avatar`) · `.list-row__main` (`.list-row__title` with `.list-row__name` + optional inline `.badge`s, optional `.list-row__sub`) · `.list-row__trailing` (a `.switch`, or a `.btn` action cluster).
```html
<div class="card">
  <div class="card__content card__content--flush">
    <div class="list-rows">
      <div class="list-row">
        <div class="list-row__icon" aria-hidden="true"><svg data-lucide="lock">…</svg></div>
        <div class="list-row__main">
          <div class="list-row__title"><span class="list-row__name">Two-factor authentication</span></div>
          <div class="list-row__sub">Adds a one-time code at sign-in</div>
        </div>
        <div class="list-row__trailing">
          <button class="switch" role="switch" aria-checked="true" aria-label="Two-factor authentication"><span class="switch__thumb"></span></button>
        </div>
      </div>
      <div class="list-row">
        <div class="avatar avatar--md" aria-hidden="true"><span class="avatar__fallback">MO</span></div>
        <div class="list-row__main">
          <div class="list-row__title"><span class="list-row__name">m.ortiz</span><span class="badge badge--neutral">Owner</span></div>
          <div class="list-row__sub">m.ortiz@acme.co &middot; last active 2h ago</div>
        </div>
        <div class="list-row__trailing">
          <button class="btn btn--ghost btn--icon-sm" type="button" aria-label="More actions"><svg data-lucide="ellipsis">…</svg></button>
        </div>
      </div>
    </div>
  </div>
</div>
```
Disabled row: `.list-row--disabled` + `aria-disabled="true"` on the trailing switch/button.
