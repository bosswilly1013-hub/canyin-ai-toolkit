const CACHE = "jiuwo-member-v3";
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") return;
  if (url.pathname.startsWith("/downloads/") || url.pathname.endsWith(".html") || url.pathname.endsWith(".js")) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok && url.pathname.startsWith("/_next/")) {
        const cache = await caches.open(CACHE);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      const hit = await caches.match(event.request);
      if (hit) return hit;
      throw error;
    }
  })());
});
