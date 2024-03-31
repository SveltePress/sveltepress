import { get, writable } from 'svelte/store'
import type { LinkItem } from 'virtual:sveltepress/theme-default'
import themeOptions from 'virtual:sveltepress/theme-default'

export const MOBILE_EDGE_WIDTH = 950

export const sidebarCollapsed = writable(true)

export const tocCollapsed = writable(true)

export const navCollapsed = writable(true)

export const anchors = writable([])

export const pages = writable<LinkItem[]>([])

export const scrollY = writable(0)

export const oldScrollY = writable(0)

export const scrollDirection = writable('up')

export const isDark = writable(false)

export const sidebar = writable(true)
export const showHeader = writable(true)

export const resolvedSidebar = writable(Object.entries((themeOptions.sidebar || {})).reduce<LinkItem[]>((all, [, item]) => [...all, ...item], []))

scrollY.subscribe(sy => {
  const nextDirection = sy - get(oldScrollY) > 0 ? 'down' : 'up'
  if (nextDirection !== get(scrollDirection))
    scrollDirection.set(nextDirection)
})

resolvedSidebar.subscribe(sidebar => {
  pages.set(sidebar.reduce<LinkItem[]>(
    (allPages, item) =>
      Array.isArray(item.items)
        ? [...allPages, ...item.items]
        : [...allPages, item],
    [],
  ))
})

sidebarCollapsed.subscribe(v => {
  if (!v)
    tocCollapsed.set(true)
})

tocCollapsed.subscribe(v => {
  if (!v)
    sidebarCollapsed.set(true)
})

export function resolveSidebar(routeId: string) {
  if (!routeId)
    return
  const key = Object.keys(themeOptions.sidebar || {}).find(key =>
    routeId.startsWith(key),
  )
  if (key)
    resolvedSidebar.set(themeOptions.sidebar?.[key] || [])
}
