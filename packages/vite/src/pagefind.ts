import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import process from 'node:process'

export interface PagefindOptions {
  /**
   * Root selector to index from.
   */
  rootSelector?: string
  /**
   * Selectors to exclude from indexing.
   */
  excludeSelectors?: string[]
  /**
   * Force language code.
   */
  forceLanguage?: string
  /**
   * Verbose logging.
   */
  verbose?: boolean
  /**
   * Output directory for pagefind assets.
   * Defaults to `${siteDir}/pagefind`
   */
  outputPath?: string
  /**
   * Whether local search indexing is enabled. Defaults to true.
   */
  enabled?: boolean
  /**
   * Site root that holds `sveltepress.versions*.json` manifests.
   * Used to skip historical `/v/` output trees unless `excludeRelativeDirs` is set.
   */
  siteRoot?: string
  /**
   * Dist-relative directories to skip when indexing the current site
   * (for example `v` and `zh/v`). Overrides manifest discovery.
   */
  excludeRelativeDirs?: string[]
}

export interface PagefindIndexResult {
  success: boolean
  outputPath?: string
  pageCount?: number
  reason?: string
}

export interface HistoricalPagefindSyncResult {
  versionId: string
  locale?: string
  cached: boolean
  success: boolean
  outputPath?: string
  reason?: string
}

/**
 * Synchronize and freeze Pagefind search assets for historical documentation versions.
 * If frozen assets already exist in version storage, copies them to outputDir without re-indexing.
 * If missing, indexes the historical version output directory and freezes assets to version storage.
 */
export async function syncHistoricalPagefind(
  siteRoot: string,
  outputDir: string,
  options?: PagefindOptions,
): Promise<HistoricalPagefindSyncResult[]> {
  if (options?.enabled === false)
    return []

  const results: HistoricalPagefindSyncResult[] = []

  if (!existsSync(siteRoot) || !existsSync(outputDir))
    return results

  const manifestFiles = readdirSync(siteRoot, { withFileTypes: true })
    .filter(entry => entry.isFile() && /^sveltepress\.versions(?:\.[a-z0-9-]+)?\.json$/.test(entry.name))
    .map(entry => entry.name)

  for (const manifestFile of manifestFiles) {
    let manifest: any
    try {
      manifest = JSON.parse(readFileSync(join(siteRoot, manifestFile), 'utf8'))
    }
    catch {
      continue
    }

    if (!manifest || !manifest.basePath || !Array.isArray(manifest.versions))
      continue

    const localeMatch = manifestFile.match(/^sveltepress\.versions\.([a-z0-9-]+)\.json$/)
    const locale = localeMatch ? localeMatch[1] : undefined

    const sourcesDir = manifest.artifacts?.sources ?? (locale ? `version-deltas-${locale}` : 'version-deltas')
    const relativeBasePath = manifest.basePath.replace(/^\/+/, '').replace(/\/+$/, '')

    for (const version of manifest.versions) {
      if (!version?.id)
        continue

      const versionId = version.id
      const versionDistDir = join(outputDir, relativeBasePath, versionId)
      if (!existsSync(versionDistDir))
        continue

      const distPagefindDir = join(versionDistDir, 'pagefind')
      const deltaVersionDir = join(siteRoot, sourcesDir, versionId)
      const deltaPagefindDir = join(deltaVersionDir, 'pagefind')

      if (existsSync(join(deltaPagefindDir, 'pagefind.js'))) {
        // Assets are frozen in version storage: copy directly without re-indexing
        mkdirSync(distPagefindDir, { recursive: true })
        cpSync(deltaPagefindDir, distPagefindDir, { recursive: true })
        results.push({
          versionId,
          locale,
          cached: true,
          success: true,
          outputPath: distPagefindDir,
        })
      }
      else {
        // Not yet frozen: generate Pagefind index scoped to this historical version
        const indexResult = await indexSiteWithPagefind(versionDistDir, {
          ...options,
          rootSelector: '.content',
          outputPath: distPagefindDir,
        })

        if (indexResult.success) {
          try {
            mkdirSync(deltaPagefindDir, { recursive: true })
            cpSync(distPagefindDir, deltaPagefindDir, { recursive: true })
          }
          catch {
            // Ignore if persistence folder cannot be created
          }
          results.push({
            versionId,
            locale,
            cached: false,
            success: true,
            outputPath: distPagefindDir,
          })
        }
        else {
          results.push({
            versionId,
            locale,
            cached: false,
            success: false,
            reason: indexResult.reason,
          })
        }
      }
    }
  }

  return results
}

/**
 * Dist-relative prefixes of frozen version output (`v`, `zh/v`, `bn/v`).
 * Current-site Pagefind must not crawl these trees; historical indexes are
 * copied from version-deltas instead.
 */
export function versionOutputPrefixesFromManifests(siteRoot: string): string[] {
  if (!existsSync(siteRoot))
    return []
  const prefixes: string[] = []
  for (const entry of readdirSync(siteRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !/^sveltepress\.versions(?:\.[a-z0-9-]+)?\.json$/.test(entry.name))
      continue
    try {
      const manifest = JSON.parse(readFileSync(join(siteRoot, entry.name), 'utf8'))
      const base = typeof manifest?.basePath === 'string'
        ? manifest.basePath.replace(/^\/+|\/+$/g, '')
        : ''
      if (base)
        prefixes.push(base)
    }
    catch {
      continue
    }
  }
  return [...new Set(prefixes)].sort()
}

function posixRelative(from: string, to: string): string {
  return relative(from, to).split(sep).join('/')
}

function isExcludedRelativePath(relativePath: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => {
    if (!prefix)
      return false
    return relativePath === prefix
      || relativePath.startsWith(`${prefix}/`)
  })
}

function collectCurrentHtmlFiles(siteDir: string, prefixes: string[]): string[] {
  const files: string[] = []
  const visit = (directory: string) => {
    if (!existsSync(directory))
      return
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name)
      const rel = posixRelative(siteDir, full)
      if (isExcludedRelativePath(rel, prefixes))
        continue
      if (entry.isDirectory()) {
        visit(full)
        continue
      }
      if (entry.isFile() && entry.name.endsWith('.html'))
        files.push(full)
    }
  }
  visit(siteDir)
  return files
}

/**
 * Index a static HTML site directory using Pagefind.
 * Emits search assets into `${siteDir}/pagefind` (or configured outputPath).
 * Historical version trees (`/v/`, `/zh/v/`, …) are skipped so current search
 * does not absorb frozen snapshots.
 */
export async function indexSiteWithPagefind(
  siteDir: string,
  options?: PagefindOptions,
): Promise<PagefindIndexResult> {
  if (options?.enabled === false) {
    return { success: false, reason: 'Pagefind indexing is disabled.' }
  }

  if (!existsSync(siteDir)) {
    return { success: false, reason: `Target site directory does not exist: ${siteDir}` }
  }

  const outputPath = options?.outputPath ?? join(siteDir, 'pagefind')
  const excludeDirs = options?.excludeRelativeDirs
    ?? versionOutputPrefixesFromManifests(options?.siteRoot ?? process.cwd())

  try {
    const pagefind = await import('pagefind')
    const { index, errors } = await pagefind.createIndex({
      rootSelector: options?.rootSelector,
      excludeSelectors: options?.excludeSelectors,
      forceLanguage: options?.forceLanguage,
      verbose: options?.verbose ?? false,
    })

    if (errors && errors.length > 0) {
      return { success: false, reason: `Pagefind createIndex error: ${errors.join(', ')}` }
    }

    const htmlFiles = collectCurrentHtmlFiles(siteDir, excludeDirs)
    let pageCount = 0
    for (const file of htmlFiles) {
      const addRes = await index.addHTMLFile({
        sourcePath: posixRelative(siteDir, file),
        content: readFileSync(file, 'utf8'),
      })
      if (addRes.errors && addRes.errors.length > 0) {
        await index.deleteIndex().catch(() => {})
        return { success: false, reason: `Pagefind addHTMLFile error: ${addRes.errors.join(', ')}` }
      }
      pageCount += 1
    }

    const writeRes = await index.writeFiles({ outputPath })
    if (writeRes.errors && writeRes.errors.length > 0) {
      await index.deleteIndex().catch(() => {})
      return { success: false, reason: `Pagefind writeFiles error: ${writeRes.errors.join(', ')}` }
    }

    // Await index asset flush to disk before deleting index or returning
    const entryPath = join(outputPath, 'pagefind-entry.json')
    if (existsSync(outputPath)) {
      const start = Date.now()
      while (Date.now() - start < 1500) {
        try {
          if (existsSync(entryPath) && statSync(entryPath).size > 0)
            break
        }
        catch {}
        await new Promise(resolve => setTimeout(resolve, 20))
      }
    }

    await index.deleteIndex().catch(() => {})
    return {
      success: true,
      outputPath,
      pageCount,
    }
  }
  catch (error) {
    return {
      success: false,
      reason: (error as Error).message,
    }
  }
}

/**
 * Clean up the background Pagefind service process if active.
 */
export async function closePagefind(): Promise<void> {
  try {
    const pagefind = await import('pagefind')
    await pagefind.close()
  }
  catch {
    // Ignore if not running or already closed
  }
}
