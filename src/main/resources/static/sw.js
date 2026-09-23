// FoodX Service Worker — phiên bản v2
// - Cache key không còn lệch khi URL có query string (?v=...) — khớp bằng path trước khi so cache.
// - Navigation: network-first, fallback index.html (offline vẫn mở app).
// - Static (/css /js /icons /images /manifest): cache-first + refresh nền; lưu cả key có query.
// - API (/api): network-first, fallback cache hoặc JSON báo offline.
// Bump CACHE_NAME mỗi khi phát hành bản thay đổi shell/app.js để người dùng nhận bản mới.
const CACHE_NAME = 'foodx-v3';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/style.bundle.css',
  '/js/main.js',
  '/js/app.js',
  '/manifest.json',
  '/icons/icon.svg'
];

// Install: cache core application shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('Pre-caching error in SW:', err))
  );
});

// Activate: clean up outdated caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/** Bản sao request không query — dùng làm key cache chuẩn. */
function cacheKeyRequest(request) {
  const url = new URL(request.url);
  url.search = '';
  return new Request(url.toString(), { method: request.method });
}

function isStaticAsset(pathname) {
  return pathname.startsWith('/css/') ||
    pathname.startsWith('/js/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/images/') ||
    pathname === '/manifest.json';
}

// Fetch: smart caching strategy
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin GET requests
  if (req.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Handle SPA navigation: Network first, fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('/index.html')) || (await cache.match('/'));
      })
    );
    return;
  }

  // Handle static assets: Cache first (khớp theo path, bỏ query), fallback to network
  if (isStaticAsset(url.pathname)) {
    const cleanKey = cacheKeyRequest(req);
    event.respondWith(
      caches.match(cleanKey).then(cachedResp => {
        if (cachedResp) {
          // Fetch updated version in background to keep cache fresh
          fetch(req).then(networkResp => {
            if (networkResp && networkResp.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(cleanKey, networkResp.clone());
                cache.put(req, networkResp);
              });
            }
          }).catch(() => {});
          return cachedResp;
        }
        return fetch(req).then(networkResp => {
          if (networkResp && networkResp.status === 200) {
            const clone = networkResp.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(cleanKey, clone);
              cache.put(req, networkResp);
            });
          }
          return networkResp;
        });
      })
    );
    return;
  }

  // Handle API calls: Network first, fallback to offline response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        return new Response(JSON.stringify({ error: 'offline', message: 'Bạn đang ngoại tuyến' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
  }
});
