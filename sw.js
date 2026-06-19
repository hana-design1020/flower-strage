const CACHE_NAME = "salesforce-admin-practice-loop-v12";
const ASSETS = [
  "./",
  "./?v=12",
  "./index.html",
  "./index.html?v=12",
  "./styles.css?v=12",
  "./app.js?v=12",
  "./app-extension.js?v=12",
  "./data/questions.js?v=12",
  "./data/additional-questions.js?v=12",
  "./data/jpn-questions.js?v=12",
  "./data/glossary.js?v=12",
  "./data/implementation-guides.js?v=12",
  "./data/implementation-guides-extra.js?v=12",
  "./manifest.webmanifest?v=12",
  "./icon.svg?v=12"
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
