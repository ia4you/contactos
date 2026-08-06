// Service worker mínimo: solo lo justo para que la PWA sea instalable.
// Estrategia network-first — la red manda siempre que haya conexión, y solo
// se sirve de caché si la red falla.
const CACHE_NAME = "contactos-turel-v1";

// Rutas que nunca pasan por el service worker (ni se cachean ni se sirven
// desde caché): la API, las subidas de usuario (ya llevan su propio
// Cache-Control agresivo desde el servidor) y las páginas con datos de
// sesión/administración sensibles o payloads de React Server Components
// que suelen venir en streaming — clonar un Response en pleno streaming
// puede fallar si el body ya se ha empezado a consumir.
const RUTAS_EXCLUIDAS = ["/admin", "/api/", "/uploads/", "/feed", "/mensajes"];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (RUTAS_EXCLUIDAS.some((ruta) => url.pathname.startsWith(ruta))) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          // clone() solo se llama una vez, y nunca debe poder tirar abajo
          // la respuesta real al usuario si falla (p. ej. porque el body ya
          // se ha empezado a consumir en algún punto del pipeline).
          try {
            const paraCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, paraCache));
          } catch {
            // No se pudo cachear esta respuesta; se sirve igualmente la
            // respuesta original de red sin problema.
          }
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
