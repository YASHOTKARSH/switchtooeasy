// Version update karna zaroori hai! Jab bhi naya code push karo, ise 'v2', 'v3' kar dena.
const CACHE_NAME = 'switchtooeasy-cache-v2';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/favicon.png',
];

// Install Event: Files ko cache (save) karna
self.addEventListener('install', (event) => {
  self.skipWaiting(); // IMPORTANT: Naye Service Worker ko turant activate karne ke liye
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate Event: Purana cache delete karna (Ye tumhare code mein missing tha)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Purana cache delete ho gaya:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Naye version ka control force apply karein
  );
});

// Fetch Event: Network First Strategy (Hamesha updates dikhayega)
self.addEventListener('fetch', (event) => {
  // Sirf GET requests ko intercept karein
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // 1. Pehle INTERNET se naya data laane ki koshish karo
    fetch(event.request).then((networkResponse) => {
      // Agar response valid hai, toh usko future ke liye cache mein save/update kar lo
      if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(() => {
      // 2. Agar internet OFF hai ya request fail ho jaye, tabhi CACHE se data do
      return caches.match(event.request);
    })
  );
});