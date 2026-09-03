// @vitest-environment happy-dom

// SEO meta audit (spec: 2026-09-02-search-i18n-version-impact.md, claim C4):
// PageLayout must emit `rel="canonical"` for current and historical pages and
// `noindex,follow` for EOL history unless the version opts out via
// `noIndex: false`. These tags are the crawler-facing surface DocSearch and
// Meilisearch indexers rely on.
import { cleanup, render } from '@testing-library/svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import PageLayout from '../src/components/PageLayout.svelte'
import { setPage } from './fixtures/app-state.svelte'
import { manifest } from './fixtures/versions'

beforeEach(() => {
  document.head.innerHTML = ''
})

afterEach(() => {
  cleanup()
  document.head.innerHTML = ''
  // Restore the EOL version's default (noindex emitted) in case a test opted out.
  manifest.versions[1].noIndex = undefined
})

function canonicalHref(): string | null {
  return document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null
}

function robotsContent(): string | null {
  return document.head.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null
}

function renderGuide() {
  return render(PageLayout, { fm: { title: 'Guide', pageType: 'md' } })
}

describe('seo meta on version-routed pages', () => {
  it('emits a self-canonical link on current pages and no noindex', () => {
    setPage('/guide/')
    renderGuide()
    expect(canonicalHref()).toBe('/guide/')
    expect(robotsContent()).toBeNull()
  })

  it('emits a self-canonical link on historical stable/deprecated pages and no noindex', () => {
    setPage('/v/2026-08-27/guide/')
    renderGuide()
    expect(canonicalHref()).toBe('/v/2026-08-27/guide/')
    expect(robotsContent()).toBeNull()
  })

  it('emits noindex,follow on EOL history by default', () => {
    setPage('/v/2026-08-26/guide/')
    renderGuide()
    expect(canonicalHref()).toBe('/v/2026-08-26/guide/')
    expect(robotsContent()).toBe('noindex,follow')
  })

  it('omits noindex on EOL history when the version opts out with noIndex false', () => {
    manifest.versions[1].noIndex = false
    setPage('/v/2026-08-26/guide/')
    renderGuide()
    expect(canonicalHref()).toBe('/v/2026-08-26/guide/')
    expect(robotsContent()).toBeNull()
  })
})
