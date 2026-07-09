### detail-header — page reached INTO (has back); identity + meta + actions + tabs
Modifiers: `.detail-header--sticky`. Slots: `__bar __back __logo __main __title __name __chips __meta __actions __tabs`.
```html
<div class="detail-header">
  <div class="detail-header__bar">
    <button class="btn btn--ghost btn--icon btn--sm detail-header__back" type="button" aria-label="Back"><svg data-lucide="chevron-left">…</svg></button>
    <span class="detail-header__logo">…</span>
    <div class="detail-header__main">
      <div class="detail-header__title">
        <span class="detail-header__name">…</span>
        <span class="badge badge--success"><span class="badge__dot"></span>…</span>
        <span class="detail-header__chips"><span class="badge badge--neutral">…</span></span>
      </div>
      <div class="detail-header__meta">
        <span style="font-family:var(--font-mono);">#…</span>
        <span>…</span>
      </div>
    </div>
    <div class="detail-header__actions">
      <button class="btn btn--secondary" type="button">Edit</button>
      <button class="btn btn--primary" type="button">…</button>
    </div>
  </div>
  <div class="detail-header__tabs">
    <div class="tabs__list tabs__list--line" role="tablist">
      <button class="tabs__trigger tabs__trigger--active" type="button" role="tab" aria-selected="true">…</button>
      <button class="tabs__trigger" type="button" role="tab" aria-selected="false">…</button>
    </div>
  </div>
</div>
```
