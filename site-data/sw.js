// Service Worker for HEAT Labs PWA
const CACHE_NAME = 'heat-labs-v1';
const urlsToCache = [
    '/',
    '/index',
    '/assets/css/main.css',
    '/assets/js/main.js',
    'https://cdn.jsdelivr.net/gh/HEATLabs/HEAT-Labs-Images@main/logo/logo.webp'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            // Return cached version or fetch from network
            return response || fetch(event.request);
        })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});