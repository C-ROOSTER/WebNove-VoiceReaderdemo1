const CACHE = 'wnvr-cache-v1';

const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install: cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;  // serve from cache

      return fetch(event.request)
        .then(response => {
          // Update cache with new resource
          const clone = response.clone();
          if (event.request.method === 'GET') {
            caches.open(CACHE).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html')); // Offline fallback
    })
  );
});
