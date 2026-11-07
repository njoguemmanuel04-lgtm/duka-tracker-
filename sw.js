const CACHE = 'duka-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['/', '/index.html', '/manifest.json']))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(response => {
      // Clone and update cache with fresh response if successful
      if(response && response.status === 200 && response.type === 'basic') {
        let responseClone = response.clone();
        caches.open(CACHE).then(cache => {
          cache.put(e.request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // Fallback to cache when offline
      return caches.match(e.request).then(cachedResponse => {
        return cachedResponse || caches.match('/index.html');
      });
    })
  );
});
