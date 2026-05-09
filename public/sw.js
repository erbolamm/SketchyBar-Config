const CACHE = 'barra-v1';
const assets = ['/', '/index.html', '/styles.css', '/app.js', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(assets)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  if (e.request.url.startsWith('http://localhost:2999/api/')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
