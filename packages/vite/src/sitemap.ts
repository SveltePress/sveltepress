import type { LocalesConfig } from './types.js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

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
      const alternates = prefixes
        .map((other) => {
          const lang = locales[other]?.lang ?? other
          return `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(`${origin}${joinLocalePath(other, route)}`)}"/>`
        })
        .join('\n')
      entries.push(`  <url>\n    <loc>${escapeXml(href)}</loc>\n${alternates}\n  </url>`)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`
  mkdirSync(outputDirectory, { recursive: true })
  writeFileSync(join(outputDirectory, 'sitemap.xml'), xml)
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
