// @ts-nocheck
/* eslint-disable no-restricted-globals */
import { ExpirationPlugin } from 'workbox-expiration'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute, PrecacheFallbackPlugin } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting()
})

const entries = self.__WB_MANIFEST

const entriesAfterProcessed = entries.map((entry) => {
  if (typeof entry === 'object')
    entry.url = entry.url.replace(/(\.\/(\.\.\/)*\.sveltepress\/prerendered)|(index\/?$)/g, '')
  return entry
})

// Remove the unnecessary index suffix of route entries
precacheAndRoute(entriesAfterProcessed)

// clean old assets
cleanupOutdatedCaches()

const pageExpiration = {
  maxEntries: 50,
  maxAgeSeconds: 7 * 24 * 60 * 60,
}

function pageFallbackPlugin() {
  return new PrecacheFallbackPlugin({ fallbackURL: '/' })
}

// Only the root route may fall back to the precached homepage. generateSW
// and an unrestricted NavigationRoute would otherwise serve `/` on every
// document-page refresh.
const route = new NavigationRoute(
  createHandlerBoundToURL('/'),
  { allowlist: [/^\/$/] },
)

const versionBase = import.meta.env.SVELTEPRESS_VERSION_BASE
if (versionBase) {
  registerRoute(
    ({ request, url }) => request.mode === 'navigate' && url.pathname.startsWith(`${versionBase}/`),
    new NetworkFirst({
      cacheName: 'sveltepress-version-pages',
      networkTimeoutSeconds: 3,
      plugins: [
        new ExpirationPlugin(pageExpiration),
        pageFallbackPlugin(),
      ],
    }),
  )
}

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'sveltepress-pages',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin(pageExpiration),
      pageFallbackPlugin(),
    ],
  }),
)

registerRoute(
  ({ url }) => url.pathname.includes('/__data.json'),
  new NetworkFirst({
    cacheName: 'sveltepress-data',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin(pageExpiration),
    ],
  }),
)

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'sveltepress-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
)

registerRoute(route)
