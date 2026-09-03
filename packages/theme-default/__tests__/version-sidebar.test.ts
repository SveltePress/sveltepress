import type { VersionManifest } from '@sveltepress/vite/versioning'
import { describe, expect, it } from 'vitest'
import { getLifecycleBanner, getVersionOptions, nextVersionMenuIndex, resolveHistoricalEditLink, resolveVersionSearch, resolveVersionSidebar } from '../src/components/versioning'

const currentSidebar = {
  '/guide/': [{ title: 'Current', items: [{ title: 'Install', to: '/guide/install/' }] }],
}

const manifest: VersionManifest = {
  basePath: '/v',
  current: { id: 'v9', label: '9.x', routes: ['/', '/guide/install/'] },
  versions: [{
    id: 'v8',
    label: '8.x',
    status: 'stable',
    routes: ['/', '/guide/install/'],
    sidebar: {
      '/guide/': [{ title: 'Historical', items: [{ title: 'Install 8', to: '/guide/install/' }] }],
    },
  }],
  content: { include: ['**'], exclude: [], shared: [] },
}

describe('historical sidebar', () => {
  it('uses the frozen sidebar for the active historical logical route', () => {
    expect(resolveVersionSidebar('/v/v8/guide/install/', currentSidebar, manifest)).toEqual([
      { title: 'Historical', items: [{ title: 'Install 8', to: '/v/v8/guide/install/' }] },
    ])
  })

  it('uses the live sidebar for current routes', () => {
    expect(resolveVersionSidebar('/guide/install/', currentSidebar, manifest)).toEqual(currentSidebar['/guide/'])
  })

  it('builds same-page and fallback selector targets', () => {
    const options = getVersionOptions('/reference/new/', manifest)
    expect(options.find(option => option.id === 'v8')?.target).toEqual({ href: '/v/v8/', fallback: true })
    expect(getVersionOptions('/guide/install/', manifest).find(option => option.id === 'v8')?.target).toEqual({ href: '/v/v8/guide/install/', fallback: false })
  })

  it('cycles keyboard focus without leaving the menu', () => {
    expect(nextVersionMenuIndex(0, 'ArrowUp', 3)).toBe(2)
    expect(nextVersionMenuIndex(2, 'ArrowDown', 3)).toBe(0)
    expect(nextVersionMenuIndex(1, 'Home', 3)).toBe(0)
    expect(nextVersionMenuIndex(1, 'End', 3)).toBe(2)
  })

  it('describes deprecated and EOL pages but not stable pages', () => {
    const deprecated = structuredClone(manifest)
    deprecated.versions[0].status = 'deprecated'
    expect(getLifecycleBanner('/v/v8/guide/install/', deprecated)?.target).toBe('/guide/install/')
    expect(getLifecycleBanner('/guide/install/', deprecated)).toBeNull()
    expect(getLifecycleBanner('/v/v8/guide/install/', manifest)).toBeNull()
    const eol = structuredClone(manifest)
    eol.versions[0].status = 'eol'
    expect(getLifecycleBanner('/v/v8/guide/install/', eol)?.status).toBe('eol')
  })

  it('resolves snapshot edit links and honors source refs and suppression', () => {
    const withRef = structuredClone(manifest)
    withRef.versions[0].sourceRef = 'docs-v8'
    expect(resolveHistoricalEditLink(
      'https://github.com/acme/docs/edit/main/src/routes/:route',
      '/v/v8/guide/install',
      'md',
      withRef,
    )).toBe('https://github.com/acme/docs/edit/docs-v8/src/routes/v/v8/guide/install/+page.md')
    withRef.versions[0].editLink = false
    expect(resolveHistoricalEditLink('https://example.com/:route', '/v/v8/', 'md', withRef)).toBeNull()
  })

  it('never duplicates the locale segment in localized edit links', () => {
    const sharedTemplate = 'https://github.com/acme/docs/edit/main/packages/docs-site/src/routes/:route'
    const zh = resolveHistoricalEditLink(sharedTemplate, '/zh/guide/install', 'md', null)
    const bn = resolveHistoricalEditLink(sharedTemplate, '/bn/guide/introduction', 'md', null)
    const en = resolveHistoricalEditLink(sharedTemplate, '/guide/install', 'md', null)
    expect(zh).toBe('https://github.com/acme/docs/edit/main/packages/docs-site/src/routes/zh/guide/install/+page.md')
    expect(bn).toBe('https://github.com/acme/docs/edit/main/packages/docs-site/src/routes/bn/guide/introduction/+page.md')
    expect(en).toBe('https://github.com/acme/docs/edit/main/packages/docs-site/src/routes/guide/install/+page.md')
    expect(zh).not.toContain('/zh/zh/')
    expect(bn).not.toContain('/bn/bn/')
    expect((zh!.match(/\/zh\//g) ?? []).length).toBe(1)
    expect((bn!.match(/\/bn\//g) ?? []).length).toBe(1)
  })

  it('keeps locale-prefixed historical source refs pointing at the frozen ref', () => {
    const withRef = structuredClone(manifest)
    withRef.basePath = '/zh/v'
    withRef.versions[0].sourceRef = 'docs-v8'
    const link = resolveHistoricalEditLink(
      'https://github.com/acme/docs/edit/main/src/routes/:route',
      '/zh/v/v8/guide/install',
      'md',
      withRef,
    )
    expect(link).toBe('https://github.com/acme/docs/edit/docs-v8/src/routes/zh/v/v8/guide/install/+page.md')
    expect(link).not.toContain('/zh/zh/')
  })

  it('requires explicit historical search metadata', () => {
    expect(resolveVersionSearch('/guide/install/', manifest)).toMatchObject({ available: true, historical: false })
    expect(resolveVersionSearch('/v/v8/guide/install/', manifest)).toMatchObject({ available: false, historical: true })
    const configured = structuredClone(manifest)
    configured.versions[0].search = { indexName: 'docs-v8', facetFilters: ['version:v8'] }
    expect(resolveVersionSearch('/v/v8/guide/install/', configured)).toMatchObject({
      available: true,
      metadata: { indexName: 'docs-v8', facetFilters: ['version:v8'] },
    })
  })
})
