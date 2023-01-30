import { writable } from 'svelte/store'

export const sidebarCollapsed = writable(true)

export const tocCollapsed = writable(true)

export const anchors = writable([])

export const pages = writable([])

sidebarCollapsed.subscribe((v) => {
  if (!v)
    tocCollapsed.set(true)
})

tocCollapsed.subscribe((v) => {
  if (!v)
    sidebarCollapsed.set(true)
})
