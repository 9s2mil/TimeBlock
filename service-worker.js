const CACHE_NAME = "timeblock-vv2";
const BASE = "/TimeBlock/";

const FILES = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "TimeBlock.css",
  BASE + "TimeBlock.js",
  BASE + "icons/icon-192.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(FILES))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).catch(() => {
        if (req.mode === "navigate") {
          return caches.match(BASE + "index.html");
        }
      });
    })
  );
});