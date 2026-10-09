// Uygulamanın internetsiz (ve okul ağındaki engelde) açılması için dosyaları telefonda saklar.
// Uygulama her açılışta telefondaki kopyadan açılır; yeni sürüm SURUM değiştirilince gelir.
const SURUM = 'derslerim-1.3';
const DOSYALAR = ['./', 'index.html', 'plan.js', 'benim-plan.js','manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

// Engel sayfası gibi yabancı içeriklerin kopyaya girmemesi için kontrol
async function gecerli(yol, r) {
  if (!r.ok || r.redirected) return false;
  if (yol === './' || yol.endsWith('.html')) return (await r.clone().text()).includes('id="nav"');
  if (yol === 'plan.js') return (await r.clone().text()).startsWith('window.PLAN');
  if (yol === 'benim-plan.js') return (await r.clone().text()).includes('window.ONERI');
  return true;
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SURUM);
    for (const yol of DOSYALAR) {
      const r = await fetch(yol, {cache: 'reload'});
      if (!(await gecerli(yol, r))) throw new Error('Geçersiz içerik: ' + yol);
      await c.put(yol, r);
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SURUM).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const istek = e.request.mode === 'navigate' ? 'index.html' : e.request;
  e.respondWith(caches.match(istek, {ignoreSearch: true}).then(r => r || fetch(e.request)));
});
