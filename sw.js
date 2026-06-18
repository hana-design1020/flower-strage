const CACHE_NAME = "salesforce-admin-practice-loop-v10";
const ASSETS = [
  "./",
  "./?v=10",
  "./index.html",
  "./index.html?v=10",
  "./styles.css?v=10",
  "./app.js?v=10",
  "./app-extension.js?v=10",
  "./data/questions.js?v=10",
  "./data/additional-questions.js?v=10",
  "./data/glossary.js?v=10",
  "./data/implementation-guides.js?v=10",
  "./data/implementation-guides-extra.js?v=10",
  "./manifest.webmanifest?v=10",
  "./icon.svg?v=10"
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
