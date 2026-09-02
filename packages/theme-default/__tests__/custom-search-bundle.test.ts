// Custom-search production bundling regression (spec:
// 2026-09-02-search-i18n-version-impact.md, claim C6): a string `search` path
// must be bundled into static production builds. The theme plugin serves the
// resolved source file through a virtual module whose loader is a literal
// dynamic import — the specifier Vite bundles into a lazy chunk — instead of a
// runtime `import(/* @vite-ignore */ path)` that the browser can never fetch.
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
