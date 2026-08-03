const CACHE_NAME = 'switchtooeasy-cache-v1';

// Yahan wo files dalein jo aap chahte hain offline available rahein
const urlsToCache = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/favicon.png',
  // Agar aapka koi custom CSS/JS static folder mein hai toh wo bhi yahan daal sakte hain
];

// Install Event: Files ko cache (save) karna
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch Event: Agar internet hai toh live data do, nahi toh Cache se data do
self.addEventListener('fetch', (event) => {
  // Sirf GET requests ko intercept karein
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Agar cache mein file mil gayi toh wo return karo
      if (response) {
        return response;
      }
      
      // Agar cache mein nahi hai toh network se fetch karo aur cache mein save karte jao
      return fetch(event.request).then((networkResponse) => {
        // Response valid na ho toh wapas bhej do
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Future offline use ke liye cache mein daal do
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Agar internet nahi hai aur cache bhi nahi hai
        // Aap yahan ek default offline page dikha sakte hain
      });
    })
  );
});