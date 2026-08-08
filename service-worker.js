const CACHE_NAME = "literate-eureka-v1";

const FILES_TO_CACHE = [
    "/literate-eureka/",
    "/literate-eureka/index.html",
    "/literate-eureka/style.css",
    "/literate-eureka/script.js",
    "/literate-eureka/manifest.json",
    "/literate-eureka/icon-192.png",
    "/literate-eureka/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
