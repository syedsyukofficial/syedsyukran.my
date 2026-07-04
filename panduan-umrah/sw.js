/* Service Worker - Panduan Umrah Bergambar (sokongan luar talian) */
var CACHE = 'panduan-umrah-v2';
var FAIL_TERAS = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FAIL_TERAS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

/* Strategi: HALAMAN (HTML) sentiasa cuba RANGKAIAN dahulu supaya kemas kini terus terpapar;
   guna cache hanya jika offline. Aset lain (gambar/fon) — cache dahulu untuk kelajuan & offline. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var ialahHalaman = e.request.mode === 'navigate' || (e.request.headers.get('accept') || '').indexOf('text/html') !== -1;

  if (ialahHalaman) {
    e.respondWith(
      fetch(e.request).then(function (jawapan) {
        var salinan = jawapan.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, salinan); });
        return jawapan;
      }).catch(function () {
        return caches.match(e.request).then(function (sedia) { return sedia || caches.match('./index.html'); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function (sedia) {
      if (sedia) return sedia;
      return fetch(e.request).then(function (jawapan) {
        var salinan = jawapan.clone();
        if (jawapan.ok || jawapan.type === 'opaque') {
          caches.open(CACHE).then(function (c) { c.put(e.request, salinan); });
        }
        return jawapan;
      });
    })
  );
});
