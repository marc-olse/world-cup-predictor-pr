const CACHE_NAME = 'primicos-pwa-v4';
const PRECACHE_URLS = [
  '/offline.html',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('primicos-pwa-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET' || request.mode !== 'navigate') {
    return;
  }

  event.respondWith(
    fetch(request).catch(() =>
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.match('/offline.html'))
        .then(
          (response) =>
            response ||
            new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            }),
        ),
    ),
  );
});
