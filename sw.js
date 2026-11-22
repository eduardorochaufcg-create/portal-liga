var V = 'equantis-v6';   // mude o número para forçar a atualização em todos os aparelhos
var ARQ = ['./', 'index.html', 'simbolo.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'manifest.json'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(ARQ); })); self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }));
  self.clients.claim();
});
// só guarda os arquivos do próprio app; chamadas à API (outro domínio / POST) passam direto
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.ok) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); }
    return res;
  }).catch(function () { return caches.match(r, {ignoreSearch: true}).then(function (m) { return m || (r.mode === 'navigate' ? caches.match('index.html') : Response.error()); }); }));
});
