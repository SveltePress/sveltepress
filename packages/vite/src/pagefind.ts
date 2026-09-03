import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

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
 * Index a static HTML site directory using Pagefind.
 * Emits search assets into `${siteDir}/pagefind` (or configured outputPath).
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

    const addRes = await index.addDirectory({ path: siteDir })
    if (addRes.errors && addRes.errors.length > 0) {
      await pagefind.close()
      return { success: false, reason: `Pagefind addDirectory error: ${addRes.errors.join(', ')}` }
    }

    const writeRes = await index.writeFiles({ outputPath })
    if (writeRes.errors && writeRes.errors.length > 0) {
      await pagefind.close()
      return { success: false, reason: `Pagefind writeFiles error: ${writeRes.errors.join(', ')}` }
    }

    await pagefind.close()
    return {
      success: true,
      outputPath,
      pageCount: addRes.page_count,
    }
  }
  catch (error) {
    return {
      success: false,
      reason: (error as Error).message,
    }
  }
}
