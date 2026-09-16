import type { VersionArtifactManifest, VersionChangeSet, VersionManifest } from './index.js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { readVersionArtifactManifest } from './artifact-store.js'

export const VITE_PRERENDER_SCOPE_CURRENT = 'current-only'

export interface OverlayLifecycleCopy {
  statusLabel: string
  message: string
  currentLabel: string
  currentHref: string
}

export interface OverlayHistoricalPageInput {
  distRoot: string
  localeDir: string
  logicalRoute: string
  basePath: string
  currentVersionId: string
  historicalVersionId: string
  lifecycle?: OverlayLifecycleCopy
}

export interface OverlayLocaleInput {
  distRoot: string
  localeDir: string
  basePath: string
  currentVersionId: string
  historical: VersionArtifactManifest
  lifecycle?: OverlayLifecycleCopy
  storeRoot?: string
  changes?: VersionChangeSet | null
}

export function historicalUrl(basePath: string, versionId: string, logicalRoute: string): string {
  const base = `/${basePath.replace(/^\/+|\/+$/g, '')}/`
  const suffix = logicalRoute === '/' ? '' : logicalRoute.replace(/^\/+/, '')
  return `${base}${versionId}/${suffix}`.replace(/\/{2,}/g, '/')
}

export function currentUrl(localeDir: string, logicalRoute: string): string {
  if (!localeDir)
    return logicalRoute === '/' ? '/' : logicalRoute
  const prefix = `/${localeDir.replace(/^\/+|\/+$/g, '')}`
  return logicalRoute === '/' ? `${prefix}/` : `${prefix}${logicalRoute}`
}

export function distIndexPath(distRoot: string, urlPath: string): string {
  const relative = urlPath.replace(/^\/+|\/+$/g, '')
  return relative ? join(distRoot, relative, 'index.html') : join(distRoot, 'index.html')
}

export function countHistoricalOverlayPages(
  manifest: VersionManifest,
  storeRoot: string,
  siteId: string,
): number {
  return manifest.versions.reduce((total, version) => {
    const artifact = readVersionArtifactManifest(storeRoot, siteId, version.id)
    if (artifact)
      return total + Object.keys(artifact.pages).length
    return total + (version.routes?.length ?? 0)
  }, 0)
}

export function rewriteHtmlForHistoricalPage(
  html: string,
  input: {
    currentUrl: string
    historicalUrl: string
    currentVersionId: string
    historicalVersionId: string
    lifecycle?: OverlayLifecycleCopy
  },
): string {
  let out = html
  out = replaceCanonical(out, input.currentUrl, input.historicalUrl)
  out = replaceVersionLabel(out, input.currentVersionId, input.historicalVersionId)
  out = out.replace(/\sdata-pagefind-body(?:="[^"]*")?/g, '')
  out = neutralizeSvelteKitStart(out)
  if (!out.includes('version-lifecycle'))
    out = injectLifecycleBanner(out, input.lifecycle ?? defaultLifecycle(input.historicalUrl))
  return out
}

export function extractPushedHtml(serverJs: string): string {
  const chunks: string[] = []
  const pattern = /\$\$renderer\.push\(`([\s\S]*?)`\)/g
  for (const match of serverJs.matchAll(pattern))
    chunks.push(unescapeSvelteTemplate(match[1]))
  return chunks.join('')
}

export function replaceClassInnerHtml(html: string, className: string, inner: string): string {
  const marker = `class="${className}`
  const startClass = html.indexOf(marker)
  if (startClass < 0)
    return html
  const openEnd = html.indexOf('>', startClass)
  if (openEnd < 0)
    return html
  const tagStart = html.lastIndexOf('<', startClass)
  const tagNameMatch = html.slice(tagStart + 1, startClass).match(/^([a-z0-9-]+)/i)
  if (!tagNameMatch)
    return html
  const tag = tagNameMatch[1]
  const close = findMatchingClose(html, openEnd + 1, tag)
  if (close < 0)
    return html
  return `${html.slice(0, openEnd + 1)}${inner}${html.slice(close)}`
}

function unescapeSvelteTemplate(value: string): string {
  return value
    .replace(/\\`/g, '`')
    .replace(/\\\$/g, '$')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\\\/g, '\\')
}

function findMatchingClose(html: string, from: number, tag: string): number {
  const open = new RegExp(`<${tag}\\b`, 'g')
  const close = new RegExp(`</${tag}>`, 'g')
  open.lastIndex = from
  close.lastIndex = from
  let depth = 1
  while (depth > 0) {
    const nextOpen = open.exec(html)
    const nextClose = close.exec(html)
    if (!nextClose)
      return -1
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1
      close.lastIndex = open.lastIndex
    }
    else {
      depth -= 1
      if (depth === 0)
        return nextClose.index
      open.lastIndex = close.lastIndex
    }
  }
  return -1
}

export function overlayHistoricalVersion(input: OverlayLocaleInput): number {
  let written = 0
  const currentHome = distIndexPath(input.distRoot, currentUrl(input.localeDir, '/'))
  for (const logicalRoute of Object.keys(input.historical.pages).sort()) {
    const fromUrl = currentUrl(input.localeDir, logicalRoute)
    const toUrl = historicalUrl(input.basePath, input.historical.versionId, logicalRoute)
    const sourcePath = distIndexPath(input.distRoot, fromUrl)
    const templatePath = existsSync(sourcePath) ? sourcePath : currentHome
    if (!existsSync(templatePath))
      continue
    let rewritten = rewriteHtmlForHistoricalPage(readFileSync(templatePath, 'utf8'), {
      currentUrl: existsSync(sourcePath) ? fromUrl : currentUrl(input.localeDir, '/'),
      historicalUrl: toUrl,
      currentVersionId: input.currentVersionId,
      historicalVersionId: input.historical.versionId,
      lifecycle: input.lifecycle,
    })
    if (logicalRoute === '/whats-new/' && input.changes) {
      rewritten = rewriteWhatsNewHtml(rewritten, input.basePath, input.historical.versionId, input.changes)
    }
    else if (input.storeRoot) {
      const page = input.historical.pages[logicalRoute]
      const body = page ? artifactPushedHtml(input.storeRoot, page.artifactHash) : ''
      if (body && rewritten.includes('class="content'))
        rewritten = replaceClassInnerHtml(rewritten, 'content', body)
    }
    const target = distIndexPath(input.distRoot, toUrl)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, rewritten)
    written += 1
  }
  return written
}

export function rewriteWhatsNewHtml(
  html: string,
  basePath: string,
  versionId: string,
  changes: VersionChangeSet,
): string {
  let out = html
  out = out.replace(
    /(<section class="release-summary[^"]*" aria-label=")[^"]+(")/,
    `$1${versionId}$2`,
  )
  out = out.replace(
    /(<strong class="release-version[^"]*">)[^<]+/,
    `$1${versionId}`,
  )
  out = out.replace(/ selected(?:="")?/g, '')
  out = out.replace(
    new RegExp(`(<option value="${escapeRegExp(versionId)}")`),
    '$1 selected=""',
  )
  out = out.replace(
    /(<div class="release-stat release-stat--new[^"]*"[^>]*>\s*<strong[^>]*>)[^<]+/,
    `$1${changes.newPages.length}`,
  )
  out = out.replace(
    /(<div class="release-stat release-stat--updated[^"]*"[^>]*>\s*<strong[^>]*>)[^<]+/,
    `$1${changes.updatedPages.length}`,
  )
  const sections = renderWhatsNewSections(basePath, versionId, changes)
  if (out.includes('class="change-sections'))
    return replaceClassInnerHtml(out, 'change-sections', sections)
  return out.replace('</section>', `</section>${sections}`)
}

export function writeHistoricalLlmsFromArtifacts(input: {
  storeRoot: string
  historical: VersionArtifactManifest
  outputDir: string
  routePrefix: string
  title?: string
}): void {
  const lines = [`# ${input.title ?? input.historical.versionId}`, '']
  for (const page of Object.values(input.historical.pages).sort((a, b) => a.route.localeCompare(b.route))) {
    const source = readArtifactMarkdown(input.storeRoot, page.artifactHash)
    if (!source)
      continue
    const title = titleFromMarkdown(source) || page.route
    const url = `${input.routePrefix}${page.route === '/' ? '/' : page.route}`.replace(/\/{2,}/g, '/')
    lines.push(`- [${title}](${url.replace(/\/$/, '')})`)
  }
  mkdirSync(input.outputDir, { recursive: true })
  writeFileSync(join(input.outputDir, 'llms.txt'), `${lines.join('\n')}\n`)
}

function artifactPushedHtml(storeRoot: string, artifactHash: string): string {
  const serverPath = join(storeRoot, 'blobs', artifactHash, 'server.js')
  if (!existsSync(serverPath))
    return ''
  return extractPushedHtml(readFileSync(serverPath, 'utf8'))
}

function readArtifactMarkdown(storeRoot: string, artifactHash: string): string | null {
  const metadataPath = join(storeRoot, 'blobs', artifactHash, 'metadata.json')
  if (!existsSync(metadataPath))
    return null
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8')) as { sourceFile?: string }
  if (typeof metadata.sourceFile !== 'string' || extname(metadata.sourceFile) !== '.md')
    return null
  const sourcePath = join(storeRoot, 'blobs', artifactHash, 'sources', metadata.sourceFile)
  return existsSync(sourcePath) ? readFileSync(sourcePath, 'utf8') : null
}

function titleFromMarkdown(source: string): string {
  if (!source.startsWith('---\n'))
    return ''
  const end = source.indexOf('\n---', 4)
  if (end < 0)
    return ''
  for (const line of source.slice(4, end).split('\n')) {
    if (!line.startsWith('title:'))
      continue
    return line.slice('title:'.length).trim().replace(/^["']|["']$/g, '')
  }
  return ''
}

function renderWhatsNewSections(
  basePath: string,
  versionId: string,
  changes: VersionChangeSet,
): string {
  const parts: string[] = []
  if (changes.newPages.length) {
    parts.push(`<section class="change-section change-section--new" aria-labelledby="version-new-pages"><header class="change-section-heading"><h2 id="version-new-pages">New pages <span class="section-count">${changes.newPages.length}</span></h2></header><ul class="change-grid">${
      changes.newPages.map(page => `<li class="change-card"><a class="change-card-link" href="${historicalUrl(basePath, versionId, page.route)}"><span>${escapeHtml(page.title)}</span></a></li>`).join('')
    }</ul></section>`)
  }
  if (changes.updatedPages.length) {
    parts.push(`<section class="change-section change-section--updated" aria-labelledby="version-updated-pages"><header class="change-section-heading"><h2 id="version-updated-pages">Updated pages <span class="section-count">${changes.updatedPages.length}</span></h2></header><ul class="change-grid">${
      changes.updatedPages.map((page) => {
        const sections = page.sections.map(section => `<li><a class="section-link" href="${historicalUrl(basePath, versionId, page.route)}#${section.id}">${escapeHtml(section.title)}</a> <small>${escapeHtml(section.introducedIn)}</small>${section.summary ? `<p>${escapeHtml(section.summary)}</p>` : ''}</li>`).join('')
        return `<li class="change-card"><a class="change-card-link" href="${historicalUrl(basePath, versionId, page.route)}"><span>${escapeHtml(page.title)}</span></a>${sections ? `<ul class="changed-sections">${sections}</ul>` : ''}</li>`
      }).join('')
    }</ul></section>`)
  }
  return parts.join('')
}

function defaultLifecycle(historicalUrl: string): OverlayLifecycleCopy {
  const currentHref = historicalUrl.match(/^\/([a-z0-9-]+)\/v\//)
    ? `/${historicalUrl.split('/')[1]}/`
    : '/'
  return {
    statusLabel: 'Deprecated',
    message: 'You are viewing an older version of this site. Some features may not work as expected.',
    currentLabel: 'Current version',
    currentHref,
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replaceCanonical(html: string, fromUrl: string, toUrl: string): string {
  const pattern = new RegExp(
    `(<link\\s+rel="canonical"\\s+href=")${escapeRegExp(fromUrl)}(")`,
    'g',
  )
  if (pattern.test(html))
    return html.replace(pattern, `$1${toUrl}$2`)
  return html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"/,
    `<link rel="canonical" href="${toUrl}"`,
  )
}

function replaceVersionLabel(html: string, currentId: string, historicalId: string): string {
  return html.replace(
    new RegExp(`(class="version-selector[^"]*"[\\s\\S]{0,800}?<span>)${escapeRegExp(currentId)}(</span>)`, 'g'),
    `$1${historicalId}$2`,
  )
}

function neutralizeSvelteKitStart(html: string): string {
  return html.replace(
    /kit\.start\([\s\S]*?\}\);/,
    '/* sveltepress overlay: static historical page */',
  )
}

function injectLifecycleBanner(html: string, copy: OverlayLifecycleCopy): string {
  const banner = [
    `<aside role="status" class="version-lifecycle" aria-label="${escapeHtml(copy.statusLabel)}">`,
    `<div class="lifecycle-message"><strong>${escapeHtml(copy.statusLabel)}</strong> `,
    `<span>${escapeHtml(copy.message)}</span></div> `,
    `<a href="${escapeHtml(copy.currentHref)}" class="link" aria-label="${escapeHtml(copy.currentLabel)}">`,
    `<span>${escapeHtml(copy.currentLabel)}</span></a></aside>`,
  ].join('')
  return html.replace(/<body([^>]*)>/, `<body$1>${banner}`)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
