import type { VersionManifest } from './index.js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function generateVersionSitemap(
  manifest: VersionManifest,
  siteRoot: string,
  baseUrl = '',
  outputDirectory = join(siteRoot, 'static'),
) {
  const origin = baseUrl.replace(/\/$/, '')
  const urls = new Set<string>()
  for (const route of manifest.current.routes ?? [])
    urls.add(`${origin}${route}`)
  for (const version of manifest.versions) {
    if (version.status === 'eol' && version.noIndex !== false)
      continue
    for (const route of version.routes ?? [])
      urls.add(`${origin}${joinRoute(manifest.basePath, version.id, route)}`)
  }
  const entries = [...urls].sort().map(url => `  <url><loc>${escapeXml(url)}</loc></url>`)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
  mkdirSync(outputDirectory, { recursive: true })
  writeFileSync(join(outputDirectory, 'sitemap.xml'), xml)
}

function joinRoute(basePath: string, versionId: string, route: string) {
  const logical = route === '/' ? '' : route.replace(/^\//, '')
  return `${basePath}/${versionId}/${logical}`.replace(/\/+/g, '/').replace(/\/?$/, '/')
}

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
