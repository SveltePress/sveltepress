import type { LlmsConfig, LocalesConfig, PageInfo } from './types.js'
import type { VersionManifest } from './versioning/index.js'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import yaml from 'yaml'

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>, body: string } {
  content = content.replace(/\r\n/g, '\n')
  if (!content.startsWith('---')) {
    return { frontmatter: {}, body: content }
  }
  const end = content.indexOf('\n---', 3)
  if (end === -1) {
    return { frontmatter: {}, body: content }
  }
  const yamlStr = content.slice(4, end)
  const body = content.slice(end + 4).trimStart()
  let frontmatter: Record<string, unknown> = {}
  try {
    const parsed = yaml.parse(yamlStr)
    if (parsed && typeof parsed === 'object')
      frontmatter = parsed as Record<string, unknown>
  }
  catch {
    // fallback: ignore parse errors
  }
  return { frontmatter, body }
}

function deriveRoutePath(filePath: string, routesDir: string): string {
  const rel = relative(routesDir, filePath)
  // Remove the Markdown source or generated artifact-shell filename.
  const dir = rel.replace(/[/\\]\+page\.(?:md|svelte)$/, '').replace(/^\+page\.(?:md|svelte)$/, '')
  if (!dir)
    return '/'
  // Split and filter out route groups like (group)
  const parts = dir.split(/[/\\]/).filter(p => !/^\(.*\)$/.test(p))
  return `/${parts.join('/')}`
}

function collectPages(dir: string, excludedRoots: string[] = []): string[] {
  const results: string[] = []
  if (!existsSync(dir))
    return results
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (excludedRoots.some(root => root && resolve(full) === resolve(root)))
      continue
    const stat = statSync(full)
    if (stat.isDirectory()) {
      results.push(...collectPages(full, excludedRoots))
    }
    else if (entry === '+page.md' || (entry === '+page.svelte' && isArtifactShell(full))) {
      results.push(full)
    }
  }
  return results
}

function isArtifactShell(filePath: string): boolean {
  return readFileSync(filePath, 'utf8').includes('<!-- sveltepress:artifact-shell -->')
}

function readPageSource(filePath: string, siteRoot: string): { content: string, filterPath: string } | null {
  const raw = readFileSync(filePath, 'utf8')
  if (extname(filePath) === '.md')
    return { content: raw, filterPath: filePath }
  const artifactHash = raw.match(/virtual:sveltepress\/page-artifact\/([a-f0-9]{64})/)?.[1]
  if (!artifactHash)
    return null
  const storeRoot = process.env.SVELTEPRESS_ARTIFACT_STORE
  if (!storeRoot)
    throw new Error(`[sveltepress] Cannot generate llms output for artifact shell without SVELTEPRESS_ARTIFACT_STORE: ${filePath}`)
  const blobRoot = resolve(storeRoot, 'blobs', artifactHash)
  const metadata = JSON.parse(readFileSync(join(blobRoot, 'metadata.json'), 'utf8')) as { sourceFile?: unknown }
  if (typeof metadata.sourceFile !== 'string' || extname(metadata.sourceFile) !== '.md')
    return null
  const sourcePath = resolve(blobRoot, 'sources', metadata.sourceFile)
  const sourceRelative = relative(join(blobRoot, 'sources'), sourcePath)
  if (sourceRelative === '..' || sourceRelative.startsWith(`..${sep}`))
    throw new Error(`[sveltepress] Artifact ${artifactHash} contains an unsafe llms source path.`)
  return {
    content: readFileSync(sourcePath, 'utf8'),
    filterPath: resolve(siteRoot, metadata.sourceFile),
  }
}

function sectionOf(routePath: string): string {
  if (routePath === '/')
    return ''
  const parts = routePath.split('/').filter(Boolean)
  return parts[0] || ''
}

export function generateLlmsTxt(
  config: LlmsConfig,
  siteConfig: { title?: string, description?: string },
  manifest?: VersionManifest | null,
  siteRoot = process.cwd(),
  outputRoot = resolve(siteRoot, 'static'),
) {
  const cwd = siteRoot
  const routesDir = resolve(cwd, config.routesDir ?? 'src/routes')
  const versionRoutesRoot = manifest ? join(routesDir, manifest.basePath.slice(1)) : undefined

  generateLlmsFiles(config, siteConfig, routesDir, outputRoot, '', siteRoot, [versionRoutesRoot])
  if (manifest) {
    for (const version of manifest.versions) {
      generateLlmsFiles(
        config,
        siteConfig,
        join(versionRoutesRoot!, version.id),
        join(outputRoot, manifest.basePath.slice(1), version.id),
        `${manifest.basePath}/${version.id}`,
        siteRoot,
      )
    }
  }
}

/**
 * Generate one llms pair per locale at that locale's output root, listing only
 * that locale's pages with locale-prefixed URLs.
 */
export function generateLlmsTxtForLocales(
  config: LlmsConfig,
  siteConfig: { title?: string, description?: string },
  locales: LocalesConfig,
  manifests?: Record<string, VersionManifest | null> | null,
  siteRoot = process.cwd(),
  outputRoot = resolve(siteRoot, 'static'),
) {
  const baseRoutesDir = config.routesDir ?? 'src/routes'
  for (const [prefix] of Object.entries(locales)) {
    const localeDir = prefix === '/' ? '' : prefix.replace(/^\/+|\/+$/g, '')
    const routesDir = localeDir
      ? resolve(siteRoot, baseRoutesDir, localeDir)
      : resolve(siteRoot, baseRoutesDir)
    const outputDir = localeDir ? join(outputRoot, localeDir) : outputRoot
    const routePrefix = prefix === '/' ? '' : prefix.replace(/\/+$/, '')
    const localeManifest = manifests?.[prefix] ?? null
    const localeRelativeBasePath = localeManifest
      ? stripLocaleBasePath(localeManifest.basePath, prefix)
      : undefined
    const versionRoutesRoot = localeRelativeBasePath
      ? join(routesDir, localeRelativeBasePath.slice(1))
      : undefined
    const excludedRoots = [
      ...Object.keys(locales)
        .filter(other => other !== prefix)
        .map(other => other === '/' ? undefined : join(routesDir, other.replace(/^\/+|\/+$/g, ''))),
      versionRoutesRoot,
    ]
    generateLlmsFiles(config, siteConfig, routesDir, outputDir, routePrefix, siteRoot, excludedRoots)
    if (localeManifest && localeRelativeBasePath) {
      for (const version of localeManifest.versions) {
        generateLlmsFiles(
          config,
          siteConfig,
          join(versionRoutesRoot!, version.id),
          join(outputDir, localeRelativeBasePath.slice(1), version.id),
          `${localeManifest.basePath}/${version.id}`,
          siteRoot,
        )
      }
    }
  }
}

function stripLocaleBasePath(basePath: string, prefix: string): string {
  const normalizedPrefix = prefix.replace(/\/+$/, '')
  if (normalizedPrefix === '/')
    return basePath
  if (basePath.startsWith(`${normalizedPrefix}/`))
    return basePath.slice(normalizedPrefix.length)
  return basePath
}

function generateLlmsFiles(
  config: LlmsConfig,
  siteConfig: { title?: string, description?: string },
  routesDir: string,
  outputDir: string,
  routePrefix: string,
  siteRoot: string,
  excludedRoots: Array<string | undefined> = [],
) {
  const files = collectPages(routesDir, excludedRoots.filter((root): root is string => Boolean(root)))
  const configuredBaseUrl = config.baseUrl?.replace(/\/$/, '') ?? ''
  const baseUrl = `${configuredBaseUrl}${routePrefix}`

  const title = config.title ?? siteConfig.title ?? 'Untitled'
  const description = config.description ?? siteConfig.description ?? ''

  const pages: PageInfo[] = []
  for (const filePath of files) {
    let source: { content: string, filterPath: string } | null
    try {
      source = readPageSource(filePath, siteRoot)
    }
    catch (err) {
      console.warn(`[sveltepress] Failed to read ${filePath}:`, err)
      continue
    }
    if (!source)
      continue
    const { frontmatter, body } = parseFrontmatter(source.content)
    const routePath = deriveRoutePath(filePath, routesDir)
    if (config.filter && !config.filter(source.filterPath, frontmatter))
      continue
    pages.push({
      title: (frontmatter.title as string) || routePath,
      routePath,
      content: body,
      frontmatter,
    })
  }

  if (config.sort) {
    pages.sort(config.sort)
  }
  else {
    pages.sort((a, b) => a.routePath.localeCompare(b.routePath))
  }

  // Group by first-level section
  const sections = new Map<string, PageInfo[]>()
  for (const page of pages) {
    const sec = sectionOf(page.routePath)
    if (!sections.has(sec))
      sections.set(sec, [])
    sections.get(sec)!.push(page)
  }

  // Build llms.txt (index only)
  const llmsLines: string[] = [`# ${title}`]
  if (description)
    llmsLines.push(`\n> ${description}`)
  llmsLines.push('')

  for (const [sec, secPages] of sections) {
    if (sec)
      llmsLines.push(`## ${sec}`)
    for (const page of secPages) {
      const url = `${baseUrl}${page.routePath}`
      llmsLines.push(`- [${page.title}](${url})`)
    }
    llmsLines.push('')
  }

  if (!existsSync(outputDir))
    mkdirSync(outputDir, { recursive: true })

  writeFileSync(join(outputDir, 'llms.txt'), llmsLines.join('\n'), 'utf-8')

  // Build llms-full.txt (with content)
  const fullLines: string[] = [`# ${title}`]
  if (description)
    fullLines.push(`\n> ${description}`)
  fullLines.push('')

  let isFirstSection = true
  for (const [sec, secPages] of sections) {
    if (!isFirstSection)
      fullLines.push('---')
    if (sec) {
      fullLines.push(`## ${sec}`)
      fullLines.push('')
    }
    let isFirstPageInSection = true
    for (const page of secPages) {
      const url = `${baseUrl}${page.routePath}`
      if (!isFirstPageInSection)
        fullLines.push('---')
      fullLines.push(`# [${page.title}](${url})`)
      fullLines.push('')
      if (page.content.trim()) {
        fullLines.push(page.content.trim())
        fullLines.push('')
      }
      isFirstPageInSection = false
    }
    isFirstSection = false
  }

  writeFileSync(join(outputDir, 'llms-full.txt'), fullLines.join('\n'), 'utf-8')
}
