import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare let self

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

let allowlist: undefined | RegExp[]
if (import.meta.env.DEV)
  allowlist = [/^\/$/]

// to allow work offline
const route = new NavigationRoute(
  createHandlerBoundToURL('/'),
  { allowlist },
)

registerRoute(route)
