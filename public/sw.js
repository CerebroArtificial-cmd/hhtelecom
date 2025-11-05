// Simple service worker for offline caching
const VERSION = 'v1';
const CORE_CACHE = core-;
const CORE_ASSETS = [
  '/',
  '/ctm-logo.png'
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.includes(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // cache-first for same-origin navigations and static assets
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate' || url.pathname.startsWith('/_next') || url.pathname.startsWith('/public')) {
      event.respondWith(
        caches.match(req).then((cached) => {
          const fetchPromise = fetch(req).then((res) => {
            const resClone = res.clone();
            caches.open(CORE_CACHE).then((cache) => cache.put(req, resClone));
            return res;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      );
    }
  }
});
