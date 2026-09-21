// The folder URL is unique for each published tour, so its offline cache is too.
const CACHE_NAME = "sicily-booklet-cache:" + new URL(self.registration.scope).pathname;
const CORE_FILES = ["./", "./index.html", "./sicily-booklet.webmanifest", "./sicily-icon.svg", "./sicily-icon-192.png", "./sicily-icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => { event.waitUntil(self.clients.claim()); });
self.addEventListener("message", event => {
  if (event.data && event.data.type === "CACHE_URL" && event.data.url) event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.add(event.data.url)));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const isPageRequest = event.request.mode === "navigate" || new URL(event.request.url).pathname.endsWith(".html");
  if (isPageRequest) {
    event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html") || caches.match("./"))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match("./index.html"))));
});
