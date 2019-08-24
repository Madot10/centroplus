const CACHE = "centroEconomia-precache";
const precacheFiles = [
  /* Add an array of files to precache for your app */
  /* M-IMPORT */
  '/',
  '/navbar.html?v=4',
  '/navtop.html?v=4',
  '/modalnt.html?v=4',
  '/warnempty.html?v=4',
  /* PAGES */
  '/index.html?v=4',
  '/inicio/index.html?v=4',
  '/admin/index.html?v=4',
  '/admin/notificaciones/index.html?v=4',
  /* TEMPLATES */
  '/templates/archivos.html',
  '/templates/configuracion.html',
  '/templates/eventos.html',
  '/templates/informacion.html',
  '/templates/menu.html',
  '/templates/mopep.html',
  '/templates/profesores.html',
  '/templates/progresa.html',
  '/templates/salones.html',
  '/templates/voluntariado.html',
  /* STYLES */
  '/css/conf.css?v=4',
  '/css/login.css?v=4',
  '/css/place-holder.css?v=4',
  '/css/prof.css?v=4',
  '/css/style.css?v=4',
  '/css/snack.css?v=4',
  /* JS */
  '/js/dbsave.js?v=3',
  '/js/element.js?v=3',
  '/js/fireb.js?v=3',
  '/js/login.js?v=3',
  '/js/main.js?v=3',
  '/js/notifications.js?v=3',
  '/js/router.js?v=3',
  '/js/social.js?v=3',
  /* SOME MEDIA */
  '/media/logoCEDEC.png?v=4',
  /* SRC */
  '/src/firebase/firebase-messaging.min.js',
  '/src/firebase/firebase-firestore.min.js',
  '/src/firebase/firebase-auth.min.js',
  '/src/firebase/firebase-performance.min.js',
  '/src/firebase/firebase-app.min.js',

  '/src/popper/popper.min.js',
  '/src/jquery/jquery.min.js',
  '/src/bootstrap-4.3.1-dist/css/bootstrap.min.css',
  '/src/bootstrap-4.3.1-dist/js/bootstrap.min.js'
];

self.addEventListener("install", function (event) {
  console.log("[PWA Builder] Install Event processing");

  console.log("[PWA Builder] Skip waiting on install");
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      console.log("[PWA Builder] Caching pages during install");
      return cache.addAll(precacheFiles);
    })
  );
});

// Allow sw to control of current page
self.addEventListener("activate", function (event) {
  console.log("[PWA Builder] Claiming clients for current page");
  event.waitUntil(self.clients.claim());
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (event) { 
  if (event.request.method !== "GET") return;

  event.respondWith(
    fromCache(event.request).then(
      function (response) {
        // The response was found in the cache so we responde with it and update the entry

        // This is where we call the server to get the newest version of the
        // file to use the next time we show view
        event.waitUntil(
          fetch(event.request).then(function (response) {
            return updateCache(event.request, response);
          })
        );

        return response;
      },
      function () {
        // The response was not found in the cache so we look for it on the server
        return fetch(event.request)
          .then(function (response) {
            // If request was success, add or update it in the cache
            event.waitUntil(updateCache(event.request, response.clone()));

            return response;
          })
          .catch(function (error) {
            console.log("[PWA Builder] Network request failed and no cache." + error);
          });
      }
    )
  );
});

function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      if (!matching || matching.status === 404) {
        return Promise.reject("no-match");
      }

      return matching;
    });
  });
}

function updateCache(request, response) {
  return caches.open(CACHE).then(function (cache) {
    return cache.put(request, response);
  });
}
