// @vitest-environment happy-dom

// Theme search-runtime audit (spec: 2026-09-02-search-i18n-version-impact.md,
// claims C1, C2, C5): Navbar must resolve DocSearch per locale, gate search on
// the version's `search` metadata (merging facetFilters/indexName overrides),
// show the "unavailable" notice on history without a search configuration, and
// hand custom search components the active version and version metadata.
import { cleanup, render, waitFor } from '@testing-library/svelte'
import { tick } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Navbar from '../src/components/Navbar.svelte'
import { setPage } from './fixtures/app-state.svelte'
import CustomSearchProbe from './fixtures/CustomSearchProbe.svelte'
import { localeFixture, setLocaleFixtures } from './fixtures/locale'
import { resetNavigation } from './fixtures/navigation'
import themeOptions from './fixtures/theme-options'
import { manifest } from './fixtures/versions'

// Navbar loads the DocSearch widget through a dynamic import; swap it for the
// probe component so the branch can be asserted without the real package.
vi.mock('@sveltepress/docsearch/Search.svelte', async () => ({
  default: (await import('./fixtures/DocSearchProbe.svelte')).default,
}))

const originalSearch = themeOptions.search
const originalDocsearch = themeOptions.docsearch
const originalVersionSearch = manifest.versions[0].search

function enDocsearch() {
  return { appId: 'app-en', apiKey: 'key', indexName: 'en-docs' }
}

beforeEach(() => {
  setPage('/guide/')
  window.history.replaceState({}, '', '/guide/')
  resetNavigation()
  setLocaleFixtures(null)
  themeOptions.search = undefined
  themeOptions.docsearch = undefined
  manifest.versions[0].search = undefined
})

afterEach(() => {
  cleanup()
  setLocaleFixtures(null)
  themeOptions.search = originalSearch
  themeOptions.docsearch = originalDocsearch
  manifest.versions[0].search = originalVersionSearch
})

describe('docsearch resolution (claim C1)', () => {
  it('uses the site-level docsearch config and mounts the widget', async () => {
    themeOptions.docsearch = enDocsearch()
    const view = render(Navbar)
    await waitFor(() => expect(view.queryByTestId('docsearch')).not.toBeNull())
    const widget = view.getByTestId('docsearch') as HTMLElement
    expect(widget.dataset.index).toBe('en-docs')
    expect(widget.dataset.appid).toBe('app-en')
    expect(widget.dataset.facets).toBe('null')
  })

  it('resolves per-locale docsearch from the locale theme options', async () => {
    themeOptions.docsearch = enDocsearch()
    const locales = localeFixture()
    locales['/zh/']!.theme = {
      ...locales['/zh/']!.theme,
      docsearch: { appId: 'app-zh', apiKey: 'key', indexName: 'zh-docs' },
    }
    setLocaleFixtures(locales)

    const view = render(Navbar)
    await waitFor(() => expect(view.queryByTestId('docsearch')).not.toBeNull())
    expect((view.getByTestId('docsearch') as HTMLElement).dataset.index).toBe('en-docs')

    // Switching locale changes the resolved index; the widget is keyed by
    // `${versionId}:${indexName}` and remounts with the new locale's config.
    setPage('/zh/guide/')
    await tick()
    await waitFor(() => {
      const widget = view.queryByTestId('docsearch') as HTMLElement | null
      expect(widget?.dataset.index).toBe('zh-docs')
    })
  })
})

describe('historical-version search gate (claim C2)', () => {
  it('shows the unavailable notice on history without search metadata and never mounts docsearch', async () => {
    themeOptions.docsearch = enDocsearch()
    const view = render(Navbar)
    await waitFor(() => expect(view.queryByTestId('docsearch')).not.toBeNull())

    setPage('/v/2026-08-27/guide/')
    await tick()
    expect(view.getByRole('status').textContent).toBe('此文档版本不提供搜索。')
    expect(view.queryByTestId('docsearch')).toBeNull()
  })

  it('merges per-version facetFilters and indexName overrides into the docsearch config', async () => {
    themeOptions.docsearch = {
      ...enDocsearch(),
      searchParameters: { facetFilters: ['base:true'] },
    }
    manifest.versions[0].search = {
      indexName: 'v2026-08-27-docs',
      facetFilters: ['version:2026-08-27'],
    }

    const view = render(Navbar)
    await waitFor(() => expect(view.queryByTestId('docsearch')).not.toBeNull())

    setPage('/v/2026-08-27/guide/')
    await tick()
    await waitFor(() => {
      const widget = view.queryByTestId('docsearch') as HTMLElement | null
      expect(widget?.dataset.index).toBe('v2026-08-27-docs')
      expect(widget?.dataset.facets).toBe('["version:2026-08-27"]')
    })
  })
})

describe('custom search contract (claim C5)', () => {
  it('loads a string source-path search through the bundled custom-search module', async () => {
    themeOptions.search = '/src/lib/MeilisearchSearch.svelte'
    const view = render(Navbar)
    await waitFor(() => expect(view.queryByTestId('custom-search')).not.toBeNull())
    // The fixture loader stands in for the plugin-generated virtual module; the
    // component still receives the version context through the public contract.
    expect((view.getByTestId('custom-search') as HTMLElement).dataset.version).toBe('2026-08-28')
  })

  it('passes the active version and per-version metadata to the custom component', async () => {
    themeOptions.search = CustomSearchProbe
    manifest.versions[0].search = { facetFilters: ['version:2026-08-27'] }

    const view = render(Navbar)
    await waitFor(() => expect(view.queryByTestId('custom-search')).not.toBeNull())

    // Current version: version context present, no per-version metadata.
    expect((view.getByTestId('custom-search') as HTMLElement).dataset.version).toBe('2026-08-28')
    expect((view.getByTestId('custom-search') as HTMLElement).dataset.metadata).toBe('null')

    // Historical version with search metadata: version + metadata delivered.
    setPage('/v/2026-08-27/guide/')
    await tick()
    await waitFor(() => {
      const probe = view.queryByTestId('custom-search') as HTMLElement | null
      expect(probe?.dataset.version).toBe('2026-08-27')
      expect(probe?.dataset.metadata).toBe('{"facetFilters":["version:2026-08-27"]}')
    })
  })

  it('keeps custom search from rendering on history without search metadata', async () => {
    themeOptions.search = CustomSearchProbe
    const view = render(Navbar)
    await waitFor(() => expect(view.queryByTestId('custom-search')).not.toBeNull())

    setPage('/v/2026-08-27/guide/')
    await tick()
    expect(view.getByRole('status').textContent).toBe('此文档版本不提供搜索。')
    expect(view.queryByTestId('custom-search')).toBeNull()
  })

  it('prefers a custom search component over docsearch', async () => {
    themeOptions.search = CustomSearchProbe
    themeOptions.docsearch = enDocsearch()

    const view = render(Navbar)
    await waitFor(() => expect(view.queryByTestId('custom-search')).not.toBeNull())
    expect(view.queryByTestId('docsearch')).toBeNull()
  })
})
