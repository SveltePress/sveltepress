import type {
  VersionContext,
  VersionManifest,
  VersionRuntime,
  VersionSwitchTarget,
} from './index.js'

export interface LocaleVersionRuntime extends VersionRuntime {
  /** Manifests keyed by locale prefix. */
  manifests: Record<string, VersionManifest | null>
  /** Resolve the manifest for a route by its locale. */
  resolveVersionManifest: (pathname: string) => VersionManifest | null
}

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
    return { versionId: historical.id, version: historical, logicalPath, historical: true, basePath: manifest.basePath, manifest }
  }
  return { versionId: manifest.current.id, version: manifest.current, logicalPath: cleanPath, historical: false, basePath: manifest.basePath, manifest }
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
    resolveVersionChanges: (versionId, _pathname) => manifest ? changeSets[versionId ?? manifest.current.id] ?? null : null,
    resolveVersionContext: pathname => resolveVersionContext(pathname, manifest),
    resolveVersionedPath: (to, context) => resolveVersionedPath(to, context, manifest),
    resolveVersionSwitch: (pathname, targetVersionId) => manifest ? resolveVersionSwitch(pathname, targetVersionId, manifest) : null,
  }
}

/**
 * A version runtime over per-locale manifests: every route resolves its
 * manifest by locale, version routes compose with the locale prefix, current
 * logical paths are stripped of the locale prefix, and resolved contexts
 * carry their manifest so path helpers stay consistent.
 */
export function createLocaleVersionRuntime(
  manifests: Record<string, VersionManifest | null>,
  resolvePrefix: (pathname: string) => string | null,
): LocaleVersionRuntime {
  const defaultManifest = Object.values(manifests).find(manifest => manifest) ?? null
  const changeSets = Object.fromEntries(
    Object.values(manifests)
      .flatMap(manifest => manifest ? [manifest.current, ...manifest.versions] : [])
      .filter(version => version.changes)
      .map(version => [version.id, version.changes!]),
  )
  const resolveManifest = (pathname: string): VersionManifest | null => {
    const prefix = resolvePrefix(pathname)
    return prefix ? (manifests[prefix] ?? null) : null
  }
  const logicalPathFor = (pathname: string, context: VersionContext, prefix: string | null): string => {
    if (context.historical || !prefix || prefix === '/')
      return context.logicalPath
    return stripLocalePrefix(pathname, prefix)
  }
  return {
    manifest: defaultManifest,
    manifests,
    changeSets,
    resolveVersionManifest: resolveManifest,
    resolveVersionChanges: (versionId?: string, pathname?: string) => {
      const prefix = pathname ? resolvePrefix(pathname) : null
      const manifest = prefix ? (manifests[prefix] ?? null) : defaultManifest
      if (!manifest)
        return null
      const target = versionId
        ? [manifest.current, ...manifest.versions].find(version => version.id === versionId)
        : manifest.current
      return target?.changes ?? null
    },
    resolveVersionContext: (pathname) => {
      const prefix = resolvePrefix(pathname)
      const manifest = prefix ? (manifests[prefix] ?? null) : null
      const context = resolveVersionContext(pathname, manifest)
      if (context) {
        context.logicalPath = logicalPathFor(pathname, context, prefix)
        context.manifest = manifest
        if (manifest)
          context.basePath = manifest.basePath
      }
      return context
    },
    resolveVersionedPath: (to, context) => resolveVersionedPath(to, context, context?.manifest ?? defaultManifest),
    resolveVersionSwitch: (pathname, targetVersionId) => {
      const prefix = resolvePrefix(pathname)
      const manifest = prefix ? (manifests[prefix] ?? null) : null
      if (!manifest)
        return null
      const target = targetVersionId === manifest.current.id
        ? manifest.current
        : manifest.versions.find(version => version.id === targetVersionId)
      const context = resolveVersionContext(pathname, manifest)
      if (!context || !target)
        return null
      const logicalPath = logicalPathFor(pathname, context, prefix)
      const routeExists = !target.routes?.length || target.routes.includes(normalizeRoute(logicalPath))
      const resolvedPath = routeExists ? logicalPath : '/'
      const href = target.id === manifest.current.id
        ? joinLocalePrefix(prefix, resolvedPath)
        : joinRoute(manifest.basePath, target.id, resolvedPath)
      return { href, fallback: !routeExists }
    },
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

/**
 * Compose a current-version target within the active locale: the locale
 * prefix must be preserved so `/zh/v/<old>/guide/` switches to `/zh/guide/`
 * (and missing pages fall back to `/zh/`), while the unprefixed default
 * locale keeps plain `/guide/` behavior.
 */
function joinLocalePrefix(prefix: string | null, logicalPath: string): string {
  if (!prefix || prefix === '/')
    return normalizeRoute(logicalPath)
  return normalizeRoute(`${prefix.replace(/\/+$/, '')}${normalizeRoute(logicalPath)}`)
}

function stripQueryAndHash(value: string): string {
  return value.split(/[?#]/, 1)[0]
}

function stripLocalePrefix(pathname: string, prefix: string): string {
  const cleanPath = stripQueryAndHash(pathname)
  const normalized = prefix.replace(/\/+$/, '')
  if (cleanPath === normalized)
    return '/'
  return normalizeRoute(cleanPath.slice(normalized.length))
}

function splitPathSuffix(value: string): { pathname: string, suffix: string } {
  const index = value.search(/[?#]/)
  return index === -1 ? { pathname: value, suffix: '' } : { pathname: value.slice(0, index), suffix: value.slice(index) }
}
