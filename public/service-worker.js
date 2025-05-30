const CACHE_NAME = 'remix-app-cache-v1';

// Only cache the index page for testing
const urlsToCache = [
  '/',
];

// Wait for the initial page load
self.addEventListener('install', (event) => {
  // Skip waiting to ensure the service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Installing...');
      return Promise.all(
        urlsToCache.map(url =>
          fetch(url, { cache: 'no-store' })  // Don't use cache for initial fetch
            .then(response => {
              if (response.ok) {
                console.log(`Service Worker: Caching ${url}`);
                return cache.put(url, response);
              }
              console.warn(`Service Worker: Failed to cache ${url}`);
              return Promise.resolve();
            })
            .catch(err => {
              console.warn(`Service Worker: Error caching ${url}:`, err);
              return Promise.resolve();
            })
        )
      );
    })
  );
});

// Activate immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Take control of all clients
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Only handle fetch events after the page is fully loaded
let isInitialLoad = true;
self.addEventListener('fetch', (event) => {
  // Skip the initial page load
  if (isInitialLoad) {
    isInitialLoad = false;
    return;
  }

  // Only handle requests to the index page
  if (event.request.url.endsWith('/') || event.request.url.endsWith('/index.html')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
            console.log('Service Worker: Cached new response for:', event.request.url);
          });

          return response;
        });
      })
    );
  }
}); 