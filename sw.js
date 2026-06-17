const CACHE_NAME = "salesforce-admin-practice-loop-v8";
const ASSETS = [
  "./",
  "./?v=8",
  "./index.html",
  "./index.html?v=8",
  "./styles.css?v=8",
  "./app.js?v=8",
  "./data/questions.js?v=8",
  "./data/glossary.js?v=8",
  "./data/implementation-guides.js?v=8",
  "./manifest.webmanifest?v=8",
  "./icon.svg?v=8"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
