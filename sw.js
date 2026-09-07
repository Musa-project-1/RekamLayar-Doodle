// ============================================================
// sw.js - Service worker untuk offline-first (PWA)
// ============================================================
const CACHE_NAME = "reka-v1";
const PRECACHE = [
  "./",
  "./index.html",
  "./dist/styles.css",
  "./js/app.js",
  "./js/config.js",
  "./js/state.js",
  "./js/dom.js",
  "./js/utils.js",
  "./js/ui.js",
  "./js/settings.js",
  "./js/timer.js",
  "./js/timer-extended.js",
  "./js/media.js",
  "./js/gdrive.js",
  "./js/drag.js",
  "./js/crop.js",
  "./js/trimmer.js",
  "./js/doodle.js",
  "./js/mobile.js",
  "./js/history.js",
  "./js/events.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        // Jangan cache request Google API.
        if (e.request.url.includes("googleapis.com") || e.request.url.includes("google.com")) {
          return res;
        }
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      }).catch(() => {
        // HANYA kembalikan index.html jika request adalah navigasi halaman utama!
        if (e.request.destination === "document" || e.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
