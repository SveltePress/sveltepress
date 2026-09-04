import type { VersionManifest, VersionNavigationItem, VersionSwitchTarget } from '@sveltepress/vite/versioning'
import { resolveVersionContext, resolveVersionedPath, resolveVersionSwitch } from '@sveltepress/vite/versioning/runtime'

type VersionSwitcher = (pathname: string, targetVersionId: string) => VersionSwitchTarget | null

export function getVersionOptions(
  routeId: string,
  manifest: VersionManifest | null,
  switchVersion?: VersionSwitcher,
) {
  if (!manifest)
    return []
  const resolveTarget = switchVersion
    ?? ((pathname: string, id: string) => resolveVersionSwitch(pathname, id, manifest))
  const versions = [manifest.current, ...manifest.versions]
  return versions.map(version => ({
    ...version,
    target: resolveTarget(routeId, version.id),
  }))
}

export function nextVersionMenuIndex(current: number, key: string, length: number): number {
  if (key === 'ArrowDown')
    return (current + 1) % length
  if (key === 'ArrowUp')
    return (current - 1 + length) % length
  if (key === 'Home')
    return 0
  if (key === 'End')
    return length - 1
  return current
}

export function getLifecycleBanner(
  routeId: string,
  manifest: VersionManifest | null,
  switchVersion?: VersionSwitcher,
) {
  const context = resolveVersionContext(routeId, manifest)
  if (!context?.historical || !['deprecated', 'eol'].includes(context.version.status ?? 'stable') || !manifest)
    return null
  const resolveTarget = switchVersion
    ?? ((pathname: string, id: string) => resolveVersionSwitch(pathname, id, manifest))
  const target = resolveTarget(routeId, manifest.current.id)
  return {
    status: context.version.status as 'deprecated' | 'eol',
    message: context.version.message,
    target: target?.href ?? '/',
    fallback: target?.fallback ?? true,
  }
}

export function resolveHistoricalEditLink(
  editLink: string | undefined,
  routeId: string,
  pageType: 'md' | 'svelte',
  manifest: VersionManifest | null,
): string | null {
  if (!editLink)
    return null
  const context = resolveVersionContext(routeId, manifest)
  if (context?.version.editLink === false)
    return null
  let template = editLink
  if (context?.historical && context.version.sourceRef) {
    template = template.includes(':ref')
      ? template.replace(':ref', context.version.sourceRef)
      : template.replace(/\/(edit|blob)\/[^/]+\//, `/$1/${context.version.sourceRef}/`)
  }
  const sourceRoute = `${routeId.replace(/^\//, '').replace(/\/$/, '')}/+page.${pageType}`
  return template.replace(':route', sourceRoute)
}

export function resolveVersionSearch(routeId: string, manifest: VersionManifest | null) {
  const context = resolveVersionContext(routeId, manifest)
  const historical = context?.historical ?? false
  return {
    available: !historical || Boolean(context?.version.search),
    historical,
    version: context?.version ?? null,
    metadata: context?.version.search ?? null,
  }
}

export function resolveVersionSidebar(
  routeId: string,
  currentSidebar: Record<string, VersionNavigationItem[]>,
  manifest: VersionManifest | null,
): VersionNavigationItem[] {
  const context = resolveVersionContext(routeId, manifest)
  const configured = context?.historical && context.version.sidebar
    ? context.version.sidebar
    : currentSidebar
  const logicalPath = context?.logicalPath ?? routeId
  const key = Object.keys(configured || {})
    .sort((left, right) => right.length - left.length)
    .find(candidate => logicalPath.replace(/\/$/, '').startsWith(candidate.replace(/\/$/, '')))
  if (!key)
    return []
  return prefixItems(configured[key], context, manifest)
}

function prefixItems(items: VersionNavigationItem[], context: ReturnType<typeof resolveVersionContext>, manifest: VersionManifest | null): VersionNavigationItem[] {
  return items.map(item => ({
    ...item,
    to: item.to ? resolveVersionedPath(item.to, context, manifest) : item.to,
    items: item.items ? prefixItems(item.items, context, manifest) : item.items,
  }))
}
