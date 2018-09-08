let staticCacheName = 'restaurant-cache-v2';

let filesToCache = [
    '/',
    '/index.html',
    '/restaurant.html',
    '/css/responsive.css',
    '/css/styles.css',
    '/data/restaurants.json',
    '/img/1.jpg',
    '/img/2.jpg',
    '/img/3.jpg',
    '/img/4.jpg',
    '/img/5.jpg',
    '/img/6.jpg',
    '/img/7.jpg',
    '/img/8.jpg',
    '/img/9.jpg',
    '/img/10.jpg',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/register_sw.js',
    '/js/restaurant_info.js'
];

self.addEventListener('install', event => {
    console.log('[ServiceWorker] installed');
    event.waitUntil(
        caches.open(staticCacheName)
        .then(cache => {
            console.log('[ServiceWorker] caching filesToCache');
            return cache.addAll(filesToCache);
        })
        .catch(err => {
            console.log('Failed to open cache:', err);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activated');

    event.waitUntil(
        // get all of the cache names that exist
        caches.keys()
        .then(cacheNames => {
            // Loop over all the cache namess
            return Promise.all(
                // filter the list of cache name
                cacheNames
                .filter(cacheName => {
                    return cacheName.startsWith('restaurant-') && cacheName != staticCacheName;
                })
                .map(cacheName => {
                    // Delete caches that do not match staticCacheName
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('[ServiceWorker] fetching', event.request.url);

    if(event.request.url.hostname !== 'localhost') {
        event.request.mode = 'no-cors';
    }

    event.respondWith(
        //Try to match the request with the content of the cache
        caches.match(event.request)
        .then(cachedResponse => {
            // if got a macth in the cache - return response
            if(cachedResponse) {
                console.log("[ServiceWorker] Found in Cache", event.request.url, cachedResponse);
                // if valid response is found in cache return it
                return cachedResponse;
            }
            // If a match wasn’t found in the cache then get the new resource from the network 
            return fetch(event.request)
                .then(response => {
                    // if no response
                    if(!response) {
                        console.log("[ServiceWorker] No response from fetch ");
                        return response;
                    }

                    // if response, creates a copy of the response(clone)
                    let cacheCopy = response.clone();
                    // Open the cache
                    return caches.open(staticCacheName)
                        .then(cache => {
                            // NOTE: cache.put() is used to add the resource to the cache. 
                            // The resource is grabbed from event.request
                            // and the response is then cloned with response.clone() and added to the cache
                            // save the response for the future
                            cache.put(event.request, cacheCopy);
                            console.log('[ServiceWorker] New Data Cached', event.request.url);
                            // The original response is returned to the browser
                            return response;
                        });

                })
                //If a match wasn’t found in the cache, and the network isn’t available
                .catch(err => {
                    console.log('[ServiceWorker] Error Fetching and Caching New Data', err);
                });

        })
    );
});
