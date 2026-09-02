import { existsSync } from 'node:fs'
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
