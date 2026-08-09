// ═══════════ Service Worker — موقع إسلام PWA ═══════════
const CACHE = 'islam-site-v1';
const CORE = ['/', '/company', '/study', '/mecha', '/control', '/server', '/settings', '/notifications'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// استراتيجية: Network First — لو النت وقع، استخدم الكاش
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // متخزنش الـ API (المحتوى الحي)
  if (url.pathname.startsWith('/api/') || e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((m) => m || caches.match('/')))
  );
});

// إشعارات — رسالة من التبويب → إشعار نظام
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'NOTIFY' && 'Notification' in self) {
    self.registration.showNotification(e.data.title || 'إسلام', {
      body: e.data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      dir: 'rtl',
      lang: 'ar',
    });
  }
});
