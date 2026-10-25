const CACHE_NAME = 'ruggermatch-pwa-v17'; // Versión forzada para purga
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.jpg', // CORRECCIÓN CRÍTICA: La extensión debe coincidir con el archivo físico en GitHub
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js'
];

self.addEventListener('install', event => {
  // INYECCIÓN OBLIGATORIA: Rompe el bloqueo de espera y fuerza la toma de control
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Secuestra las pestañas activas
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  // El bypass para los endpoints de telemetría de Google
  if (url.hostname.includes('google.com') || url.hostname.includes('script.google.com')) {
      return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Listener conservado por compatibilidad con tu lógica de UI
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
