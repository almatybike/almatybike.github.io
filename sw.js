const staticCacheName = 'site-static-v10';
const dynamicCacheName = 'site-dynamic-v1';
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/main.js',
    '/img/wifi_off-24px.svg',
    '/css/styles.css',
    '/img/baseline_local_parking_black_18dp.png',
    '/img/baseline_pedal_bike_black_18dp.png',
    '/img/favicon.png',
    'https://code.jquery.com/jquery-3.5.0.js',
    '/fallback.html',
];

const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        })
    })
};

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticCacheName).then(function(cache) {
            return cache.addAll(assets);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            )
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cacheRes => {
            return cacheRes || fetch(event.request).then(fetchRes => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(event.request.url, fetchRes.clone());
                    limitCacheSize(dynamicCacheName, 100);
                    return fetchRes;
                })
            });
        }).catch(() => {
            if (event.request.url.indexOf('.html') > -1) {
                return caches.match('/fallback.html')
            }
        })
    );
});