'use strict';

// Standardized Stale-While-Revalidate Service Worker
// ⚠️ CACHE_NAME is replaced with a unique timestamp on build by the stampServiceWorker plugin.
const CACHE_NAME = 'money-manager-gsheet-cache-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icon.svg',
  './pwa-192x192.png',
  './pwa-512x512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key.startsWith('money-manager-gsheet-cache')) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Bypass Service Worker for localhost, Vite HMR, API endpoints, and non-HTTP protocols
  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.port === '3000' ||
    url.port === '3001' ||
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@react-refresh') ||
    url.pathname.includes('/@fs/') ||
    url.pathname.includes('/src/') ||
    url.pathname.includes('node_modules') ||
    url.pathname.includes('/api/') ||
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('googleapis.com') ||
    !url.protocol.startsWith('http')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background (Stale-While-Revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        return networkResponse;
      });
    }).catch(() => fetch(request))
  );
});
