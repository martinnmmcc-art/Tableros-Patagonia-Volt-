// ═══════════════════════════════════════════════════════════════
// PATAGONIA VOLT — Service Worker v5
// Estrategia: Cache-First para assets, Network-First para datos externos
// Permite uso completamente offline después del primer acceso
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'patagonia-volt-v5';
const CACHE_STATIC = 'pv-static-v5';
const CACHE_FONTS  = 'pv-fonts-v1';

// Recursos que se cachean en la instalación (app shell)
const STATIC_ASSETS = [
  './',
  './index.html',
  './sw.js',
  './manifest.json',
];

// Recursos externos (fuentes Google, CDNs) — se cachean al primer uso
const EXTERNAL_ORIGINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',           // jsPDF
];

// ── INSTALL — pre-cachear el app shell ────────────────────────
self.addEventListener('install', event => {
  console.log('[PV-SW] Instalando versión:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => {
        console.log('[PV-SW] App shell cacheado');
        return self.skipWaiting(); // activar inmediatamente
      })
      .catch(err => console.warn('[PV-SW] Error al cachear:', err))
  );
});

// ── ACTIVATE — limpiar caches viejos ──────────────────────────
self.addEventListener('activate', event => {
  console.log('[PV-SW] Activando:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_STATIC && key !== CACHE_FONTS)
          .map(key => {
            console.log('[PV-SW] Eliminando cache viejo:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim()) // tomar control de todas las pestañas
  );
});

// ── FETCH — estrategia inteligente ────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignorar requests que no son GET
  if (event.request.method !== 'GET') return;

  // Ignorar chrome-extension y otros esquemas
  if (!url.protocol.startsWith('http')) return;

  // ── Fuentes y CDN: Cache-First ──────────────────────────────
  if (EXTERNAL_ORIGINS.some(origin => url.hostname.includes(origin))) {
    event.respondWith(cacheFirst(event.request, CACHE_FONTS));
    return;
  }

  // ── App shell (HTML, JS, manifest): Stale-While-Revalidate ──
  // Sirve desde caché inmediatamente, actualiza en background
  if (url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.json') ||
      url.pathname === '/' ) {
    event.respondWith(staleWhileRevalidate(event.request, CACHE_STATIC));
    return;
  }

  // ── Todo lo demás: Network-First ────────────────────────────
  event.respondWith(networkFirst(event.request, CACHE_STATIC));
});

// ════════════════════════════════════════════════════════════════
// ESTRATEGIAS DE CACHÉ
// ════════════════════════════════════════════════════════════════

/**
 * Cache-First: sirve desde caché; si no existe, busca en red y guarda.
 * Ideal para assets que no cambian (fuentes, iconos).
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

/**
 * Stale-While-Revalidate: sirve desde caché (rápido), actualiza en background.
 * Ideal para el HTML/JS de la app.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(fresh => {
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  }).catch(() => null);

  return cached || fetchPromise || offlineFallback();
}

/**
 * Network-First: intenta la red; si falla, usa caché.
 * Para datos que deben ser frescos pero toleran offline.
 */
async function networkFirst(request, cacheName) {
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback();
  }
}

/** Respuesta de fallback cuando no hay caché ni red */
function offlineFallback() {
  return new Response(
    `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width"/>
    <title>Patagonia Volt — Sin conexión</title>
    <style>body{background:#0B1929;color:#DDE8F5;font-family:sans-serif;
      display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}
    h1{color:#00BFA5;font-size:2rem}p{color:#607D9E}</style></head>
    <body><div><h1>⚡ Patagonia Volt</h1>
    <p>Sin conexión a internet.<br>Abrí la app cuando tengas conexión para actualizar el caché.</p>
    </div></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 200 }
  );
}

// ── Comunicación con el cliente ────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_NAME });
  }
});
