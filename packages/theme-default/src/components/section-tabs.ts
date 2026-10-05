import type { SectionTab } from 'virtual:sveltepress/theme-default'

/** A scheme (`https:`, `mailto:`) or a protocol-relative `//` leaves the site. */
const EXTERNAL_LINK_RE = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i

/** An Iconify icon in `collection:name` form, e.g. `tabler:rocket`. */
const ICONIFY_NAME_RE = /^([a-z\d][a-z\d-]*):([a-z\d][a-z\d-]*)$/i

export type SectionTabIcon = { type: 'iconify', className: string } | { type: 'html', html: string }

export function isExternalSectionTabLink(to: string): boolean {
  return EXTERNAL_LINK_RE.test(to)
}

/**
 * Resolve a tab icon: `collection:name` becomes the UnoCSS preset-icons class
 * (`i-collection-name`); anything else is rendered as HTML, like navbar icons.
 */
export function resolveSectionTabIcon(icon?: string): SectionTabIcon | null {
  const value = icon?.trim()
  if (!value)
    return null
  const iconify = ICONIFY_NAME_RE.exec(value)
  if (iconify)
    return { type: 'iconify', className: `i-${iconify[1]}-${iconify[2]}` }
  return { type: 'html', html: value }
}

/** The UnoCSS icon classes used by tabs, so the theme can pre-build them. */
export function collectSectionTabIconClasses(tabs?: SectionTab[]): string[] {
  const classes = new Set<string>()
  for (const tab of tabs ?? []) {
    const icon = resolveSectionTabIcon(tab.icon)
    if (icon?.type === 'iconify')
      classes.add(icon.className)
  }
  // Not `[...classes]`: svelte-package compiles this file to ES5, where
  // spreading a Set yields an empty array.
  return Array.from(classes)
}

function normalizeRoutePrefix(route: string): string {
  const path = route.split(/[?#]/, 1)[0] || '/'
  const withLeading = path.startsWith('/') ? path : `/${path}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

/**
 * The route prefixes that make a tab active. An explicit `activeMatch` wins;
 * otherwise the tab owns the most specific sidebar key containing its link,
 * so the tab and the sidebar it shows stay in step. A tab whose link is under
 * no sidebar key owns its own page and the pages below it.
 */
export function resolveSectionTabMatches(tab: SectionTab, sidebarKeys: string[]): string[] {
  if (tab.activeMatch !== undefined) {
    const matches = Array.isArray(tab.activeMatch) ? tab.activeMatch : [tab.activeMatch]
    return matches
      .filter(match => typeof match === 'string' && match.length > 0)
      .map(normalizeRoutePrefix)
  }
  if (!tab.to || isExternalSectionTabLink(tab.to))
    return []
  const target = normalizeRoutePrefix(tab.to)
  const sidebarKey = sidebarKeys
    .map(normalizeRoutePrefix)
    // A site-wide `/` sidebar contains every tab, so it says nothing about
    // which section a tab owns.
    .filter(key => key !== '/' && target.startsWith(key))
    .sort((left, right) => right.length - left.length)[0]
  if (sidebarKey)
    return [sidebarKey]
  // Tabs never render on the home page, and a derived `/` would match every
  // route, so a tab linking home never becomes active on its own.
  return target === '/' ? [] : [target]
}

/** Route-prefix keys of a manual sidebar config; auto-sidebar options have none. */
export function sectionTabSidebarKeys(sidebar: unknown): string[] {
  if (!sidebar || typeof sidebar !== 'object' || Array.isArray(sidebar))
    return []
  return Object.keys(sidebar).filter(key => key.startsWith('/'))
}

/**
 * The index of the active tab for a logical route (locale and version prefixes
 * removed), or `-1`. The most specific match wins; ties go to the earlier tab.
 */
export function resolveActiveSectionTab(
  tabs: SectionTab[] | undefined,
  logicalPath: string,
  sidebar?: unknown,
): number {
  if (!tabs?.length || !logicalPath)
    return -1
  const path = normalizeRoutePrefix(logicalPath)
  const sidebarKeys = sectionTabSidebarKeys(sidebar)
  let activeIndex = -1
  let activeLength = -1
  tabs.forEach((tab, index) => {
    for (const prefix of resolveSectionTabMatches(tab, sidebarKeys)) {
      if (path.startsWith(prefix) && prefix.length > activeLength) {
        activeIndex = index
        activeLength = prefix.length
      }
    }
  })
  return activeIndex
}
