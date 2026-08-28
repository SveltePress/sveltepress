import type {
  VersionContext,
  VersionManifest,
  VersionRuntime,
  VersionSwitchTarget,
} from './index.js'

export function resolveVersionContext(
  pathname: string,
  manifest: VersionManifest | null,
): VersionContext | null {
  if (!manifest)
    return null
  const cleanPath = normalizeRoute(stripQueryAndHash(pathname))
  const base = manifest.basePath
  const historical = manifest.versions.find(version => cleanPath === `${base}/${version.id}/` || cleanPath.startsWith(`${base}/${version.id}/`))
  if (historical) {
    const prefix = `${base}/${historical.id}`
    const logicalPath = normalizeRoute(cleanPath.slice(prefix.length) || '/')
    return { versionId: historical.id, version: historical, logicalPath, historical: true }
  }
  return { versionId: manifest.current.id, version: manifest.current, logicalPath: cleanPath, historical: false }
}

export function resolveVersionSwitch(
  pathname: string,
  targetVersionId: string,
  manifest: VersionManifest,
): VersionSwitchTarget | null {
  const context = resolveVersionContext(pathname, manifest)
  const target = targetVersionId === manifest.current.id
    ? manifest.current
    : manifest.versions.find(version => version.id === targetVersionId)
  if (!context || !target)
    return null

  const routeExists = !target.routes?.length || target.routes.includes(normalizeRoute(context.logicalPath))
  const logicalPath = routeExists ? context.logicalPath : '/'
  const href = target.id === manifest.current.id
    ? normalizeRoute(logicalPath)
    : joinRoute(manifest.basePath, target.id, logicalPath)
  return { href, fallback: !routeExists }
}

export function resolveVersionedPath(
  to: string,
  context: VersionContext | null,
  manifest: VersionManifest | null,
): string {
  if (!manifest || !context?.historical || !to.startsWith('/') || to.startsWith('//') || to.startsWith(`${manifest.basePath}/`))
    return to
  const { pathname, suffix } = splitPathSuffix(to)
  if (!context.version.routes?.includes(normalizeRoute(pathname)))
    return to
  return `${joinRoute(manifest.basePath, context.versionId, pathname)}${suffix}`
}

export function createVersionRuntime(manifest: VersionManifest | null): VersionRuntime {
  const changeSets = Object.fromEntries(
    manifest
      ? [manifest.current, ...manifest.versions].filter(version => version.changes).map(version => [version.id, version.changes!])
      : [],
  )
  return {
    manifest,
    changeSets,
    resolveVersionChanges: versionId => manifest ? changeSets[versionId ?? manifest.current.id] ?? null : null,
    resolveVersionContext: pathname => resolveVersionContext(pathname, manifest),
    resolveVersionedPath: (to, context) => resolveVersionedPath(to, context, manifest),
    resolveVersionSwitch: (pathname, targetVersionId) => manifest ? resolveVersionSwitch(pathname, targetVersionId, manifest) : null,
  }
}

function normalizeRoute(route: string): string {
  const withLeading = route.startsWith('/') ? route : `/${route}`
  return withLeading === '/' ? '/' : `${withLeading.replace(/\/+$/, '')}/`
}

function joinRoute(basePath: string, versionId: string, logicalPath: string): string {
  const normalized = normalizeRoute(logicalPath)
  const suffix = normalized === '/' ? '' : normalized.slice(1)
  return normalizeRoute(`${basePath}/${versionId}/${suffix}`)
}

function stripQueryAndHash(value: string): string {
  return value.split(/[?#]/, 1)[0]
}

function splitPathSuffix(value: string): { pathname: string, suffix: string } {
  const index = value.search(/[?#]/)
  return index === -1 ? { pathname: value, suffix: '' } : { pathname: value.slice(0, index), suffix: value.slice(index) }
}
