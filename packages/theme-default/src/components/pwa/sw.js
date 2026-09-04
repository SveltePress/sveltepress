// @ts-nocheck
/* eslint-disable no-restricted-globals */
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute, PrecacheFallbackPlugin } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

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
      plugins: [new PrecacheFallbackPlugin({ fallbackURL: '/' })],
    }),
  )
}

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'sveltepress-pages',
    plugins: [new PrecacheFallbackPlugin({ fallbackURL: '/' })],
  }),
)

registerRoute(route)
