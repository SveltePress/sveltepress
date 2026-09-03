/**
 * Virtual module generator for custom search components.
 * Serves the resolved custom search component via a literal dynamic import
 * so that Vite bundles it into a chunk in static production builds.
 */
import { join } from 'node:path'
import process from 'node:process'

export const CUSTOM_SEARCH_MODULE = 'virtual:sveltepress/theme-default/custom-search'

/**
 * Normalize a configured `search` string into an absolute file path resolvable
 * by the bundler. Theme options use site-root-relative source paths, with or
 * without a leading slash (`/src/lib/MeilisearchSearch.svelte`); both forms
 * resolve against the site root. Virtual-module ids are rejected (they cannot
 * be bundled through a virtual re-export), and anything that is not a string
 * (component objects and booleans) is not module-resolvable → `null`.
 */
export function resolveCustomSearchFile(
  search: unknown,
  root: string = process.cwd(),
): string | null {
  if (typeof search !== 'string' || !search.trim())
    return null
  const cleaned = search.trim()
  if (cleaned.startsWith('virtual:') || cleaned.startsWith('\0'))
    return null
  return join(root, cleaned.replace(/^[/\\]+/, ''))
}

/**
 * Build the virtual module body for the resolved custom-search file. The file
 * is imported lazily through a literal `import()` so the bundler includes it;
 * without a file the loader resolves to `null` (no module to bundle).
 */
export function buildCustomSearchModule(searchPath: string | null): string {
  if (!searchPath)
    return 'export async function loadCustomSearch() {\n  return null\n}\n'
  return `export async function loadCustomSearch() {\n  return import(${JSON.stringify(searchPath)})\n}\n`
}
