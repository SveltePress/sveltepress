import type { LocalesConfig } from './types.js'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

/**
 * Resolve a `locales` config into its final form by scanning each locale's
 * routes directory and embedding the discovered route inventory. This is a
 * build-time operation only: it reads the filesystem and must never be
 * imported from client code.
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
    ...(versionBasePath ? [join(routesRoot, relativeVersionDir(versionBasePath, prefix))] : []),
  ]
  const files = collectPageFiles(routesRoot, excludedRoots)
  return [...new Set(files.map(filePath => deriveRoute(filePath, routesRoot)))].sort()
}

function relativeVersionDir(versionBasePath: string, prefix: string): string {
  const cleanBase = versionBasePath.replace(/^\/+|\/+$/g, '')
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, '')
  if (cleanPrefix && (cleanBase === cleanPrefix || cleanBase.startsWith(`${cleanPrefix}/`))) {
    return cleanBase.slice(cleanPrefix.length).replace(/^\/+/, '')
  }
  return cleanBase
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

function normalizeRoute(route: string): string {
  const withLeading = route.startsWith('/') ? route : `/${route}`
  return withLeading === '/' ? '/' : `${withLeading.replace(/\/+$/, '')}/`
}
