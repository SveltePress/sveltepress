import type { LocalesConfig, LocaleSwitchTarget, ResolvedLocale } from './types.js'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

/**
 * Resolve the locale for a route path. Prefix-based matching: the default
 * locale (`'/'`) matches every path, and longer prefixes win for everything
 * else. Returns `null` when no locales are configured or no locale matches.
 */
export function resolveLocale(
  pathname: string,
  locales?: LocalesConfig | null,
): ResolvedLocale | null {
  if (!locales || Object.keys(locales).length === 0)
    return null
  const cleanPath = stripQueryAndHash(pathname)
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
): string {
  if (!locale || !to || !to.startsWith('/') || to.startsWith('//'))
    return to
  if (locale.prefix !== '/' && matchesLocalePrefix(to, locale.prefix))
    return to
  for (const [prefix] of Object.entries(locales ?? {})) {
    if (prefix !== '/' && prefix !== locale.prefix && matchesLocalePrefix(to, prefix))
      return to
  }
  return joinLocalePath(locale.prefix, to)
}

/**
 * Compute the target of switching the current route to another locale:
 * preserve the logical page when the target locale has that route, fall back
 * to the target locale's home otherwise.
 */
export function resolveLocaleSwitch(
  pathname: string,
  targetPrefix: string,
  locales?: LocalesConfig | null,
): LocaleSwitchTarget | null {
  const current = resolveLocale(pathname, locales)
  const target = locales?.[targetPrefix]
  if (!current || !target)
    return null
  const logicalPath = stripLocalePrefix(pathname, current.prefix)
  const routeExists = !target.routes?.length || target.routes.includes(logicalPath)
  return {
    href: joinLocalePath(targetPrefix, routeExists ? logicalPath : '/'),
    fallback: !routeExists,
  }
}

/**
 * Resolve a `locales` config into its final form by scanning each locale's
 * routes directory and embedding the discovered route inventory.
 */
export function resolveLocalesConfig(
  locales: LocalesConfig,
  siteRoot: string,
  versionBasePath?: string,
): LocalesConfig {
  const resolved: LocalesConfig = {}
  for (const [prefix, config] of Object.entries(locales))
    resolved[prefix] = { ...config, routes: scanLocaleRoutes(siteRoot, prefix, locales, versionBasePath) }
  return resolved
}

/**
 * Scan one locale's routes directory for current pages (`+page.md` /
 * `+page.svelte`) and derive their logical routes (no locale prefix). Other
 * locales' directories and the version base path are excluded.
 */
export function scanLocaleRoutes(
  siteRoot: string,
  prefix: string,
  locales: LocalesConfig,
  versionBasePath?: string,
): string[] {
  const routesRoot = localeRoutesDir(siteRoot, prefix)
  const excludedRoots = [
    ...Object.keys(locales)
      .filter(other => other !== prefix)
      .map(other => localeRoutesDir(siteRoot, other))
      .filter(other => other !== routesRoot),
    ...(versionBasePath ? [join(routesRoot, versionBasePath.replace(/^\/+|\/+$/g, ''))] : []),
  ]
  const files = collectPageFiles(routesRoot, excludedRoots)
  return [...new Set(files.map(filePath => deriveRoute(filePath, routesRoot)))].sort()
}

function localeRoutesDir(siteRoot: string, prefix: string): string {
  if (prefix === '/' || prefix === '')
    return join(siteRoot, 'src/routes')
  return join(siteRoot, 'src/routes', prefix.replace(/^\/+|\/+$/g, ''))
}

function collectPageFiles(dir: string, excludedRoots: string[]): string[] {
  if (!existsSync(dir))
    return []
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (excludedRoots.some(root => resolve(full) === resolve(root)))
      continue
    const stat = statSync(full)
    if (stat.isDirectory()) {
      results.push(...collectPageFiles(full, excludedRoots))
    }
    else if (entry === '+page.md' || entry === '+page.svelte') {
      results.push(full)
    }
  }
  return results
}

function deriveRoute(filePath: string, routesRoot: string): string {
  const rel = relative(routesRoot, filePath)
  const dir = rel.replace(/[/\\]\+page\.(?:md|svelte)$/, '').replace(/^\+page\.(?:md|svelte)$/, '')
  if (!dir)
    return '/'
  const parts = dir.split(/[/\\]/).filter(p => !/^\(.*\)$/.test(p))
  return normalizeRoute(`/${parts.join('/')}`)
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
  const normalizedPath = normalizeRoute(path)
  if (prefix === '/' || prefix === '')
    return normalizedPath
  const normalizedPrefix = prefix.replace(/\/+$/, '')
  return normalizeRoute(`${normalizedPrefix}${normalizedPath}`)
}

function normalizeRoute(route: string): string {
  const withLeading = route.startsWith('/') ? route : `/${route}`
  return withLeading === '/' ? '/' : `${withLeading.replace(/\/+$/, '')}/`
}

function stripQueryAndHash(value: string): string {
  return value.split(/[?#]/, 1)[0]
}
