// プッシュ通知の受け口（2026-11-04 Slackの代わり）。画面の読み込み（fetch）には関わらない（更新は index.html の版番号で）
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// PAIR-PATCH この画面の拠点の印（福岡 ''・東京 't'）。違う拠点の知らせ（d.site）は題名に【拠点名】、go に「印|」を付ける（画面の goNorm が直す）
const OWN_SITE = '';
// サーバー（Push.gs）から {title, body, go, tag}。go＝押した時に開く所（task:ID・hand・clock・admin）
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : '' }; }
  const other = !!d.site && d.site !== OWN_SITE;
  const go = (other ? d.site + '|' : '') + String(d.go || '');
  const opt = { body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', data: { go }, silent: false,
    requireInteraction: /(^|\|)(hand$|task:)/.test(go) }; // 頼まれた個別業務・申し送りは押すまで残す（PC）
  if (d.tag) { opt.tag = d.tag; opt.renotify = true; } // 同じ知らせは重ねず、出し直す時も音を鳴らす
  e.waitUntil(Promise.all([
    self.registration.showNotification((other ? `【${d.siteName || ''}】` : '') + (d.title || '福岡徳純院'), opt),
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => cs.forEach(c => c.postMessage({ type: 'push', go }))),
  ]));
});

// 通知を押した：開いているアプリがあればそこで、なければ開いて go の所へ
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const go = (e.notification.data || {}).go || '';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => x.url.startsWith(self.registration.scope));
    if (c) { c.postMessage({ type: 'go', go }); return c.focus(); }
    return self.clients.openWindow('./' + (go ? '?go=' + encodeURIComponent(go) : ''));
  }));
});
