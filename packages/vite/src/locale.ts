import type { LocalesConfig, LocaleSwitchTarget, LocaleVersionSnapshot, ResolvedLocale } from './types.js'

/**
 * Resolve the locale for a route path. Prefix-based matching: the default
 * locale (`'/'`) matches every path, and longer prefixes win for everything
 * else. Returns `null` when no locales are configured or no locale matches.
 *
 * This module is imported from client code through the
 * `virtual:sveltepress/locale` virtual module, so it must stay free of any
 * Node.js built-in imports. Build-time filesystem scanning lives in
 * `locale-scan.ts`.
 */
export function resolveLocale(
  pathname: string,
  locales?: LocalesConfig | null,
  base?: string,
): ResolvedLocale | null {
  if (!pathname || typeof pathname !== 'string')
    return null
  if (!locales || Object.keys(locales).length === 0)
    return null
  const cleanPath = stripBase(stripQueryAndHash(pathname), base)
  if (!cleanPath.startsWith('/'))
    return null
  let best: ResolvedLocale | null = null
  let bestLength = -1
  for (const [prefix, config] of Object.entries(locales)) {
    if (!matchesLocalePrefix(cleanPath, prefix))
      continue
    if (prefix.length > bestLength) {
      bestLength = prefix.length
      best = { prefix, ...config }
    }
  }
  return best
}

/**
 * Resolve an internal link within the active locale. Links that are external,
 * already inside the active locale, or already pointing at another configured
 * locale are left unchanged; everything else is rewritten into the active
 * locale's prefix.
 */
export function resolveLocalizedPath(
  to: string,
  locale: ResolvedLocale | null,
  locales?: LocalesConfig | null,
  base?: string,
): string {
  const strippedTo = stripBase(to, base)
  if (!locale || !strippedTo || !strippedTo.startsWith('/') || strippedTo.startsWith('//'))
    return to
  const prefix = locale.prefix ?? '/'
  if (prefix !== '/' && matchesLocalePrefix(strippedTo, prefix))
    return to
  for (const [p] of Object.entries(locales ?? {})) {
    if (p !== '/' && p !== prefix && matchesLocalePrefix(strippedTo, p))
      return to
  }
  return joinLocalePath(prefix, strippedTo)
}

/**
 * Compute the target of switching the current route to another locale.
 * Language switching keeps the documentation version, the logical page, and
 * the hash/query suffix. A missing frozen page in the target locale falls
 * back to that locale's current version of the same page, then to its home.
 */
export function resolveLocaleSwitch(
  pathname: string,
  targetPrefix: string,
  locales?: LocalesConfig | null,
  base?: string,
  versionManifests?: Record<string, LocaleVersionSnapshot | null> | null,
): LocaleSwitchTarget | null {
  if (!pathname || typeof pathname !== 'string')
    return null
  const withBase = stripBase(pathname, base)
  const { pathname: pathOnly, suffix } = splitPathSuffix(withBase)
  const current = resolveLocale(pathOnly, locales)
  const target = locales?.[targetPrefix]
  if (!current || !target)
    return null

  const currentManifest = versionManifests?.[current.prefix] ?? null
  const targetManifest = versionManifests?.[targetPrefix] ?? null
  const parsed = parseVersionedPath(pathOnly, currentManifest, current.prefix)
  const withSuffix = (href: string) => `${href}${suffix}`

  if (parsed.historical && parsed.versionId) {
    const targetVersion = findVersion(targetManifest, parsed.versionId)
    if (targetManifest && targetVersion && versionHasRoute(targetVersion, parsed.logicalPage)) {
      const href = targetVersion.id === targetManifest.current.id
        ? joinLocalePath(targetPrefix, parsed.logicalPage)
        : joinVersionPath(targetManifest.basePath, parsed.versionId, parsed.logicalPage)
      return { href: withSuffix(href), fallback: false }
    }
    if (!targetManifest) {
      const remainder = stripLocalePrefix(pathOnly, current.prefix)
      return { href: withSuffix(joinLocalePath(targetPrefix, remainder)), fallback: false }
    }
    if (localeHasCurrentRoute(target, parsed.logicalPage)) {
      return { href: withSuffix(joinLocalePath(targetPrefix, parsed.logicalPage)), fallback: true }
    }
    return { href: withSuffix(joinLocalePath(targetPrefix, '/')), fallback: true }
  }

  if (localeHasCurrentRoute(target, parsed.logicalPage)) {
    return { href: withSuffix(joinLocalePath(targetPrefix, parsed.logicalPage)), fallback: false }
  }

  const remainder = stripLocalePrefix(pathOnly, current.prefix)
  if (looksLikeVersionedRemainder(remainder)) {
    return { href: withSuffix(joinLocalePath(targetPrefix, remainder)), fallback: false }
  }

  return { href: withSuffix(joinLocalePath(targetPrefix, '/')), fallback: true }
}

function parseVersionedPath(
  pathname: string,
  manifest: LocaleVersionSnapshot | null,
  localePrefix: string,
): { versionId: string | null, historical: boolean, logicalPage: string } {
  const logicalPage = stripLocalePrefix(pathname, localePrefix)
  if (!manifest)
    return { versionId: null, historical: false, logicalPage }
  const cleanPath = stripQueryAndHash(pathname)
  const historical = manifest.versions.find(version =>
    cleanPath === `${manifest.basePath}/${version.id}/`
    || cleanPath.startsWith(`${manifest.basePath}/${version.id}/`),
  )
  if (historical) {
    const prefix = `${manifest.basePath}/${historical.id}`
    return {
      versionId: historical.id,
      historical: true,
      logicalPage: normalizeRoute(cleanPath.slice(prefix.length) || '/'),
    }
  }
  return { versionId: manifest.current.id, historical: false, logicalPage }
}

function findVersion(
  manifest: LocaleVersionSnapshot | null,
  versionId: string,
): { id: string, routes?: string[] } | null {
  if (!manifest)
    return null
  if (manifest.current.id === versionId)
    return manifest.current
  return manifest.versions.find(version => version.id === versionId) ?? null
}

function versionHasRoute(version: { routes?: string[] }, logicalPage: string): boolean {
  return !version.routes?.length || version.routes.includes(logicalPage)
}

function localeHasCurrentRoute(
  target: { routes?: string[] },
  logicalPage: string,
): boolean {
  return !target.routes?.length || target.routes.some(route => matchesRoutePattern(route, logicalPage))
}

function looksLikeVersionedRemainder(path: string): boolean {
  return /^\/v\/[^/]+(?:\/|$)/.test(path)
}

function joinVersionPath(basePath: string, versionId: string, logicalPath: string): string {
  const normalized = normalizeRoute(logicalPath)
  const rest = normalized === '/' ? '' : normalized.slice(1)
  return normalizeRoute(`${basePath}/${versionId}/${rest}`)
}

export function stripBase(pathname: string, base?: string): string {
  if (!pathname || typeof pathname !== 'string')
    return ''
  if (!base || base === '/' || base === '')
    return pathname
  const normalizedBase = base.replace(/\/+$/, '')
  if (pathname === normalizedBase)
    return '/'
  if (pathname.startsWith(`${normalizedBase}/`))
    return pathname.slice(normalizedBase.length)
  return pathname
}

function matchesLocalePrefix(pathname: string, prefix: string): boolean {
  if (prefix === '/')
    return true
  const normalized = prefix.replace(/\/+$/, '')
  return pathname === normalized || pathname.startsWith(`${normalized}/`)
}

function stripLocalePrefix(pathname: string, prefix: string): string {
  const cleanPath = stripQueryAndHash(pathname)
  if (prefix === '/')
    return normalizeRoute(cleanPath)
  const normalized = prefix.replace(/\/+$/, '')
  if (cleanPath === normalized)
    return '/'
  return normalizeRoute(cleanPath.slice(normalized.length))
}

function joinLocalePath(prefix: string, path: string): string {
  const { pathname, suffix } = splitPathSuffix(path)
  const normalizedPath = normalizeRoute(pathname)
  if (prefix === '/' || prefix === '')
    return `${normalizedPath}${suffix}`
  const normalizedPrefix = prefix.replace(/\/+$/, '')
  return `${normalizeRoute(`${normalizedPrefix}${normalizedPath}`)}${suffix}`
}

function normalizeRoute(route: string): string {
  const withLeading = route.startsWith('/') ? route : `/${route}`
  return withLeading === '/' ? '/' : `${withLeading.replace(/\/+$/, '')}/`
}

function stripQueryAndHash(value: string): string {
  if (!value || typeof value !== 'string')
    return ''
  return value.split(/[?#]/, 1)[0]
}

function splitPathSuffix(value: string): { pathname: string, suffix: string } {
  const index = value.search(/[?#]/)
  return index === -1 ? { pathname: value, suffix: '' } : { pathname: value.slice(0, index), suffix: value.slice(index) }
}

/**
 * Match a concrete pathname against a scanned SvelteKit route pattern such as
 * `/posts/[slug]/`. Static segments match literally; `[param]` matches one
 * segment, `[[optional]]` matches zero or one, and `[...rest]` matches zero or
 * more. Segment counts must line up — a route with more or fewer segments than
 * the pattern never matches.
 */
export function matchesRoutePattern(pattern: string, pathname: string): boolean {
  if (!pattern)
    return false
  const segments = pattern.split('/').filter(Boolean)
  if (segments.length === 0)
    return normalizeRoute(pathname) === '/'
  let source = '^/'
  for (const segment of segments) {
    if (segment.startsWith('[...'))
      source += '(?:[^/]+(?:/[^/]+)*)?/'
    else if (segment.startsWith('[['))
      source += '(?:[^/]+)?/'
    else if (segment.startsWith('['))
      source += '[^/]+/'
    else
      source += `${escapeRegex(segment)}/`
  }
  source = `${source.replace(/\/$/, '')}/?$`
  return new RegExp(source).test(pathname)
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
