import type { VersionManifest, VersionNavigationItem } from '@sveltepress/vite/versioning'

export function getVersionOptions() {
  return []
}

export function nextVersionMenuIndex(current: number) {
  return current
}

export function getLifecycleBanner() {
  return null
}

export function resolveHistoricalEditLink(
  editLink: string | undefined,
  routeId: string,
  pageType: 'md' | 'svelte',
): string | null {
  if (!editLink)
    return null
  const sourceRoute = `${routeId.replace(/^\//, '').replace(/\/$/, '')}/+page.${pageType}`
  return editLink.replace(':route', sourceRoute)
}

export function resolveVersionSearch() {
  return {
    available: true,
    historical: false,
    version: null,
    metadata: null,
  }
}

export function resolveVersionSidebar(
  routeId: string,
  currentSidebar: Record<string, VersionNavigationItem[]>,
  _manifest?: VersionManifest | null,
): VersionNavigationItem[] {
  const key = Object.keys(currentSidebar || {})
    .sort((left, right) => right.length - left.length)
    .find(candidate => routeId.replace(/\/$/, '').startsWith(candidate.replace(/\/$/, '')))
  return key ? currentSidebar[key] : []
}
