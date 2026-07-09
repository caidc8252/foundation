### feed-list — notification/activity feed: toned icon · main · trailing time+actions
Container `.feed-list` (usually inside `.card > .card__content.card__content--flush`). Each `.feed-item` (read state: `.feed-item--read`) = `.feed-item__icon .feed-item__icon--{info|success|warning|neutral|error}` (svg) · `.feed-item__main` (`.feed-item__head` eyebrow + `.feed-item__title` + optional `.feed-item__body`) · `.feed-item__trailing` (`.feed-item__time` — may lead with `.unread-dot` — and optional `.feed-item__actions` btn cluster).
```html
<div class="feed-list">
  <div class="feed-item">
    <div class="feed-item__icon feed-item__icon--info" aria-hidden="true"><svg data-lucide="info">…</svg></div>
    <div class="feed-item__main">
      <div class="feed-item__head">INCIDENT</div>
      <div class="feed-item__title">CPU usage exceeded 90% on prod-api-3</div>
      <div class="feed-item__body">Threshold breached at 14:32 UTC. Auto-scaling triggered.</div>
    </div>
    <div class="feed-item__trailing">
      <div class="feed-item__time"><span class="unread-dot" aria-label="Unread"></span>2h ago</div>
      <div class="feed-item__actions">
        <button class="btn btn--secondary btn--sm">Acknowledge</button>
        <button class="btn btn--secondary btn--sm">View details</button>
      </div>
    </div>
  </div>
  <div class="feed-item feed-item--read">
    <div class="feed-item__icon feed-item__icon--success" aria-hidden="true"><svg data-lucide="circle-check">…</svg></div>
    <div class="feed-item__main">
      <div class="feed-item__head">BACKUP</div>
      <div class="feed-item__title">Daily backup completed</div>
      <div class="feed-item__body">…</div>
    </div>
    <div class="feed-item__trailing"><div class="feed-item__time">3h ago</div></div>
  </div>
</div>
```
Read rows drop the `.unread-dot`; action-less rows drop `.feed-item__actions`.
