// Procepal Requisiciones — Service Worker
// Versión: cambia este número cada vez que hagas un deploy para forzar actualización
const CACHE_VERSION = 'procepal-v1';
const CACHE_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalar — guarda archivos en caché
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

// Activar — borra cachés viejos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_VERSION;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch — Network First: siempre intenta la red, cae a caché si no hay conexión
self.addEventListener('fetch', function(event) {
  // Solo interceptar requests del mismo origen
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Actualiza el caché con la respuesta más reciente
        var responseClone = response.clone();
        caches.open(CACHE_VERSION).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(function() {
        // Sin red — usa caché
        return caches.match(event.request);
      })
  );
});
