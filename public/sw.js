const CACHE_NAME = 'vencimento-pa-shell-v4'
const APP_SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.svg', '/icons/icon-512.svg']
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))) })
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()) })
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match('/'))))
})
