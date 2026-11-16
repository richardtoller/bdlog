// Offline support: cache the app shell, serve cache-first, refresh in the background.
// Bird pictures go in their own cache so app updates don't throw them away.
const CACHE = 'bdlog-v3';
const IMG_CACHE = 'bdlog-img-v1';
const ASSETS = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest',
  'js/birds.js', 'js/guides.js', 'js/images.js', 'js/export.js', 'js/app.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  // Pictures never change: cache-first, stored on first view.
  if (url.pathname.includes('/img/birds/')) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(IMG_CACHE).then(c => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cached => {
      const network = fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => cached || caches.match('index.html'));
      return cached || network;
    })
  );
});
