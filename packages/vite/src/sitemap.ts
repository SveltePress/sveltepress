import type { LocalesConfig } from './types.js'
import type { VersionManifest } from './versioning/index.js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Build the `<url>` entries for the current locale routes: one entry per
 * locale that has the logical route, each listing hreflang alternates to the
 * locales that share it.
 */
function buildCurrentLocaleEntries(
  locales: LocalesConfig,
  origin: string,
): string[] {
  const routes = new Map<string, string[]>()
  for (const [prefix, locale] of Object.entries(locales)) {
    for (const route of locale.routes ?? []) {
      const prefixes = routes.get(route) ?? []
      prefixes.push(prefix)
      routes.set(route, prefixes)
    }
  }
  const entries: string[] = []
  for (const [route, prefixes] of [...routes.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    for (const prefix of prefixes) {
      const href = `${origin}${joinLocalePath(prefix, route)}`
      entries.push(buildUrlEntry(href, buildAlternates(prefixes, other => locales[other]?.lang ?? (other === '/' ? 'en' : other.replace(/^\/+|\/+$/g, '')), other => `${origin}${joinLocalePath(other, route)}`)))
    }
  }
  return entries
}

/**
 * Generate a sitemap listing every locale version of every page with
 * hreflang alternates across the locales that share the logical route.
 */
export function generateLocaleSitemap(
  locales: LocalesConfig,
  siteRoot: string,
  baseUrl = '',
  outputDirectory = join(siteRoot, 'static'),
) {
  const origin = baseUrl.replace(/\/$/, '')
  writeSitemap(buildCurrentLocaleEntries(locales, origin), outputDirectory)
}

/**
 * Generate one combined sitemap for a multi-locale versioned site: every
 * current locale route with hreflang alternates, plus every eligible
 * historical version route from each locale's manifest. EOL history is
 * excluded unless `noIndex === false`, matching `generateVersionSitemap`.
 * Historical hreflang alternates only connect locales that share the same
 * version id and logical route.
 */
export function generateLocaleVersionSitemap(
  locales: LocalesConfig,
  manifests: Record<string, VersionManifest | null>,
  siteRoot: string,
  baseUrl = '',
  outputDirectory = join(siteRoot, 'static'),
) {
  const origin = baseUrl.replace(/\/$/, '')
  const entries = buildCurrentLocaleEntries(locales, origin)

  // Historical version routes grouped by (version id, logical route) so
  // hreflang alternates only connect locales sharing that exact context.
  const byVersion = new Map<string, Map<string, Array<{ prefix: string, manifest: VersionManifest }>>>()
  for (const [prefix, manifest] of Object.entries(manifests)) {
    if (!manifest)
      continue
    for (const version of manifest.versions) {
      if (version.status === 'eol' && version.noIndex !== false)
        continue
      const byRoute = byVersion.get(version.id) ?? new Map()
      for (const route of version.routes ?? []) {
        const group = byRoute.get(route) ?? []
        group.push({ prefix, manifest })
        byRoute.set(route, group)
      }
      byVersion.set(version.id, byRoute)
    }
  }
  for (const [versionId, byRoute] of [...byVersion.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    for (const [route, group] of [...byRoute.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      for (const { manifest } of group) {
        const href = `${origin}${normalizeRoute(`${manifest.basePath}/${versionId}${route === '/' ? '' : route}`)}`
        entries.push(buildUrlEntry(
          href,
          buildAlternates(group, other => locales[other.prefix]?.lang ?? (other.prefix === '/' ? 'en' : other.prefix.replace(/^\/+|\/+$/g, '')), other => `${origin}${normalizeRoute(`${other.manifest.basePath}/${versionId}${route === '/' ? '' : route}`)}`),
        ))
      }
    }
  }

  writeSitemap(entries, outputDirectory)
}

function writeSitemap(entries: string[], outputDirectory: string) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`
  mkdirSync(outputDirectory, { recursive: true })
  writeFileSync(join(outputDirectory, 'sitemap.xml'), xml)
}

function buildUrlEntry(href: string, alternates: string): string {
  return `  <url>\n    <loc>${escapeXml(href)}</loc>\n${alternates}\n  </url>`
}

function buildAlternates<T>(group: T[], langOf: (item: T) => string, hrefOf: (item: T) => string): string {
  return group
    .map((other) => {
      const lang = langOf(other)
      return `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(hrefOf(other))}"/>`
    })
    .join('\n')
}

function joinLocalePath(prefix: string, route: string): string {
  const normalized = normalizeRoute(route)
  if (prefix === '/' || prefix === '')
    return normalized
  return normalizeRoute(`${prefix.replace(/\/+$/, '')}${normalized}`)
}

function normalizeRoute(route: string): string {
  const withLeading = route.startsWith('/') ? route : `/${route}`
  return withLeading === '/' ? '/' : `${withLeading.replace(/\/+$/, '')}/`
}

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
