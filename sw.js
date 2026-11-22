const CACHE_NAME = 'mochi-money-shell-v3';
const APP_FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('mochi-money-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(fetch(req).then(response => {
    if (response.ok && APP_FILES.some(path => new URL(path, self.registration.scope).href === req.url)) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
    }
    return response;
  }).catch(() => caches.match(req).then(cached => cached || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
