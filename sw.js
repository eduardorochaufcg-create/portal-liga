var V = 'equantis-v2';
var ARQ = ['./', 'index.html', 'simbolo.png', 'icon-192.png', 'manifest.json'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(ARQ); })); self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }));
  self.clients.claim();
});
// só guarda os arquivos do próprio app; chamadas à API (outro domínio / POST) passam direto
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(function (res) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); return res; }).catch(function () { return caches.match(r); }));
});
