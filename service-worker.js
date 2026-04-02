const CACHE_NAME = "TimeBlock-v1";

const FILES_TO_CACHE = [
  "index.html",
  "manifest.json",
  "TimeBlock.css",
  "TimeBlock.js",
  "icons/icon-192.png",
];

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  const isDoc = req.mode === 'navigate' || req.destination === 'document' || url.pathname.endsWith('.html');
  const isCode = ['script', 'style'].includes(req.destination) || url.pathname.endsWith('.js') || url.pathname.endsWith('.css');
  const isJson = url.pathname.endsWith('.json');

  if (isDoc || isCode) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  if (isJson) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(res => res || fetch(req))
  );
});

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});
