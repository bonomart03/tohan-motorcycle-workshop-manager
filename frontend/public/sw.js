self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  // Las llamadas a la API nunca se cachean
  if (e.request.url.includes("/api/")) return;
  e.respondWith(fetch(e.request));
});
