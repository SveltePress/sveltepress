import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING')
    self.skipWaiting()
})

precacheAndRoute(self.__WB_MANIFEST.map((entry) => {
  if (typeof entry === 'object')
    entry.url = entry.url.replace(/index$/, '')
  return entry
}))

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
