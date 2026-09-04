import type { LinkItem } from 'virtual:sveltepress/theme-default'
import { get, writable } from 'svelte/store'
import { resolveVersionSidebar } from 'virtual:sveltepress/theme-default/versioning'
import {
  resolveVersionChanges,
  resolveVersionContext,
  resolveVersionedPath,
  resolveVersionManifest,
} from 'virtual:sveltepress/versions'
import { resolveLocaleOptions, resolveLogicalRoute } from './locale'

export const MOBILE_EDGE_WIDTH = 950

export const sidebarCollapsed = writable(true)

export const tocCollapsed = writable(true)

export const navCollapsed = writable(true)

export const anchors = writable([])

export const pages = writable<LinkItem[]>([])

export const changedPageRoutes = writable<Set<string>>(new Set())

export const changedSectionIds = writable<Set<string>>(new Set())

export const scrollY = writable(0)

export const oldScrollY = writable(0)

export const scrollDirection = writable('up')

export const darkMode = writable('auto')
export const isDark = writable(false)

export const sidebar = writable(true)
export const showHeader = writable(true)
export const showLayout = writable(true)

export const resolvedSidebar = writable(Object.entries((resolveLocaleOptions('/').sidebar || {})).reduce<LinkItem[]>((all, [, item]) => [...all, ...item], []))

function flattenPages(items: LinkItem[]): LinkItem[] {
  const result: LinkItem[] = []
  for (const item of items) {
    if (item.to)
      result.push(item)
    if (Array.isArray(item.items))
      result.push(...flattenPages(item.items))
  }
  return result
}

scrollY.subscribe((sy) => {
  const nextDirection = sy - get(oldScrollY) > 0 ? 'down' : 'up'
  if (nextDirection !== get(scrollDirection))
    scrollDirection.set(nextDirection)
})

resolvedSidebar.subscribe((sidebar) => {
  pages.set(flattenPages(sidebar))
})

sidebarCollapsed.subscribe((v) => {
  if (!v)
    tocCollapsed.set(true)
})

tocCollapsed.subscribe((v) => {
  if (!v)
    sidebarCollapsed.set(true)
})

export function resolveSidebar(routeId: string) {
  if (!routeId)
    return
  resolveVersionNavigationChanges(routeId)
  // Historical routes must keep the locale+version prefix so the locale
  // manifest's basePath (`/zh/v`) can match. Current routes compare sidebar
  // keys in logical (locale-free) space.
  const context = resolveVersionContext(routeId)
  const pathForSidebar = context?.historical ? routeId : resolveLogicalRoute(routeId)
  resolvedSidebar.set(resolveVersionSidebar(pathForSidebar, resolveLocaleOptions(routeId).sidebar || {}, resolveVersionManifest(routeId)) as LinkItem[])
}

function resolveVersionNavigationChanges(routeId: string) {
  const context = resolveVersionContext(routeId)
  const changes = resolveVersionChanges(context?.versionId, routeId)
  if (!context || !changes) {
    changedPageRoutes.set(new Set())
    changedSectionIds.set(new Set())
    return
  }

  changedPageRoutes.set(new Set(
    [...changes.newPages, ...changes.updatedPages].map(changedPage =>
      normalizeNavigationRoute(resolveVersionedPath(changedPage.route, context)),
    ),
  ))
  const currentPageChanges = changes.updatedPages.find(changedPage =>
    normalizeNavigationRoute(changedPage.route) === normalizeNavigationRoute(context.logicalPath),
  )
  changedSectionIds.set(new Set(currentPageChanges?.sections.map(section => section.id) ?? []))
}

export function normalizeNavigationRoute(route: string): string {
  return route === '/' ? route : route.replace(/\/+$/, '')
}
