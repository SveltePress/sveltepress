import { describe, expect, it } from 'vitest'
import {
  buildCustomSearchModule,
  resolveCustomSearchFile,
} from '../src/vite-plugins/custom-search-module'

describe('resolveCustomSearchFile', () => {
  it('resolves a site-root-relative source path against the root', () => {
    expect(resolveCustomSearchFile('/src/lib/MeilisearchSearch.svelte', '/site'))
      .toBe('/site/src/lib/MeilisearchSearch.svelte')
    expect(resolveCustomSearchFile('src/lib/MeilisearchSearch.svelte', '/site'))
      .toBe('/site/src/lib/MeilisearchSearch.svelte')
  })

  it('rejects virtual-module ids and non-string search values', () => {
    expect(resolveCustomSearchFile('virtual:whatever', '/site')).toBeNull()
    expect(resolveCustomSearchFile(undefined, '/site')).toBeNull()
    expect(resolveCustomSearchFile(false, '/site')).toBeNull()
    expect(resolveCustomSearchFile('', '/site')).toBeNull()
  })
})

describe('buildCustomSearchModule', () => {
  it('emits a literal dynamic import of the resolved file', () => {
    const content = buildCustomSearchModule('/site/src/lib/MeilisearchSearch.svelte')
    expect(content).toContain('export async function loadCustomSearch()')
    expect(content).toContain('import("/site/src/lib/MeilisearchSearch.svelte")')
    // No runtime @vite-ignore import: the literal specifier is what makes the
    // wrapper part of the static production bundle.
    expect(content).not.toContain('@vite-ignore')
  })

  it('resolves to null when no custom search is configured', () => {
    const content = buildCustomSearchModule(null)
    expect(content).toContain('return null')
    expect(content).not.toContain('import(')
  })
})
