// Uygulamanın internetsiz de açılması için dosyaları telefonda saklar.
// Uygulama güncellendiğinde SURUM değiştirilir.
const SURUM = 'derslerim-1.0';
const DOSYALAR = ['./', 'index.html', 'plan.js', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SURUM).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Önce internetten yeni sürümü dener, yoksa saklanan kopyayı açar.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      const kopya = r.clone();
      caches.open(SURUM).then(c => c.put(e.request, kopya));
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}))
  );
});
