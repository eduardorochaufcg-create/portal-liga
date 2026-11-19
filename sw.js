// Service worker do Portal da Liga.
// Guarda só a "casca" do app (arquivos da interface) para abrir rápido e funcionar sem internet.
// As chamadas ao Apps Script (dados) NUNCA passam pelo cache.
var VERSAO = 'portal-liga-v1';   // mude o número quando quiser forçar atualização de todos
var ARQUIVOS = [
  './', 'index.html', 'config.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSAO)
      .then(function (c) { return c.addAll(ARQUIVOS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (k) { return k !== VERSAO; })
                             .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

// Rede primeiro (pega sempre a versão nova); se a rede demorar mais de 4 s ou cair, usa o cache.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;     // Apps Script e outros sites: direto na rede

  e.respondWith(new Promise(function (resolve) {
    var resolvido = false;
    function responder(r) { if (!resolvido && r) { resolvido = true; resolve(r); } }
    function doCache() {
      return caches.match(req, {ignoreSearch: true}).then(function (r) {
        return r || (req.mode === 'navigate' ? caches.match('index.html') : undefined);
      });
    }
    var timer = setTimeout(function () { doCache().then(responder); }, 4000);
    fetch(req).then(function (resp) {
      clearTimeout(timer);
      if (resp && resp.ok) {
        var copia = resp.clone();
        caches.open(VERSAO).then(function (c) { c.put(req, copia); });
      }
      responder(resp);
    }).catch(function () {
      clearTimeout(timer);
      doCache().then(function (r) { responder(r || Response.error()); });
    });
  }));
});
