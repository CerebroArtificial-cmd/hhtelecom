const VERSION = 'v4';
const CORE_CACHE = 'core-' + VERSION;
const API_CACHE  = 'api-' + VERSION;

// Assets base para uso offline (opcional)
const CORE_ASSETS = [
  '/',              // shell (se SPA)
  '/ctm-logo.png',
  // '/offline.html', // se quiser página de fallback
];

// ===== Fila offline para POSTs de ingestão =====
const DB_NAME = 'offline-queue-db';
const DB_STORE = 'queue';

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(DB_STORE, { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function idbTx(db, mode) { const tx = db.transaction(DB_STORE, mode); return [tx, tx.objectStore(DB_STORE)]; }
async function queueAdd(entry) {
  const db = await idbOpen(); const [tx, store] = idbTx(db, 'readwrite');
  store.add(entry);
  await new Promise(r => (tx.oncomplete = r));
}
async function queueAll() {
  const db = await idbOpen(); const [_, store] = idbTx(db, 'readonly');
  return new Promise((resolve, reject) => {
    const req = store.getAll(); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
  });
}
async function queueDelete(id) {
  const db = await idbOpen(); const [tx, store] = idbTx(db, 'readwrite');
  store.delete(id);
  await new Promise(r => (tx.oncomplete = r));
}
function isIngestUrl(urlStr) {
  const u = new URL(urlStr);
  // Mesma origem e endpoints suportados
  return u.origin === self.location.origin &&
    (u.pathname === '/ingest_bulk' || u.pathname === '/ingest_bulk/FotosChecklist');
}
async function handleIngestPost(req) {
  try {
    // Tenta enviar normalmente
    return await fetch(req.clone());
  } catch (e) {
    // Offline/falha → enfileira
    let body = null;
    try { body = await req.clone().json(); } catch (_) {}
    const headers = Array.from(req.headers.entries());
    await queueAdd({ url: req.url, method: 'POST', headers, body, ts: Date.now() });
    if ('sync' in self.registration) {
      try { await self.registration.sync.register('sync-ingest'); } catch (_) {}
    }
    return new Response(JSON.stringify({ ok: true, queued: true }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
async function flushQueue() {
  const items = await queueAll();
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: new Headers(item.headers),
        body: item.body ? JSON.stringify(item.body) : undefined,
      });
      if (res.ok) await queueDelete(item.id);
    } catch (_) {
      // mantém na fila
    }
  }
}
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-ingest') {
    event.waitUntil(flushQueue());
  }
});
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'flush-queue') {
    event.waitUntil(flushQueue());
  }
});

// ===== Install / Activate =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => !k.includes(VERSION))
        .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ===== Fetch =====
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // (A) Intercepta POSTs de ingestão e enfileira offline
  if (req.method === 'POST' && isIngestUrl(req.url)) {
    event.respondWith(handleIngestPost(req));
    return;
  }

  // (B) Demais rotas: apenas GET
  if (req.method !== 'GET') return;

  // 1) Assets do Next.js (imutáveis) -> cache-first
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          const clone = res.clone();
          caches.open(CORE_CACHE).then((cache) => cache.put(req, clone));
          return res;
        })
      )
    );
    return;
  }

  // 2) Navegação -> network-first, fallback cache
  if (req.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CORE_CACHE).then((cache) => cache.put(req, clone));
        return res;
      }).catch(async () => {
        const cached = await caches.match(req);
        // return cached || caches.match('/offline.html');
        return cached || Response.error();
      })
    );
    return;
  }

  // 3) APIs GET do backend -> network-first + cache leve
  const isApi =
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/dados') ||
     url.pathname.startsWith('/dados_all') ||
     url.pathname.startsWith('/schema') ||
     url.pathname.startsWith('/refs'));
  if (isApi) {
    event.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(API_CACHE).then((cache) => cache.put(req, clone));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // 4) Estáticos (png/js/css) -> stale-while-revalidate
  const isStatic = /\.(png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$/.test(url.pathname);
  if (isStatic && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetched = fetch(req).then((res) => {
          const clone = res.clone();
          caches.open(CORE_CACHE).then((cache) => cache.put(req, clone));
          return res;
        }).catch(() => cached);
        return cached || fetched;
      })
    );
  }
});

