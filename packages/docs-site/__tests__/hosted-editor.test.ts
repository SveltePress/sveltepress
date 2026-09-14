// @vitest-environment happy-dom

import { cleanup, render, waitFor, within } from '@testing-library/svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BASIC_WRITING_SLUG,
  githubImportPath,
  PINNED_STARTERS_TAG,
  shippingEntries,
} from '../src/lib/playground/catalog.ts'
import PlaygroundApp from '../src/lib/playground/PlaygroundApp.svelte'

afterEach(cleanup)

describe('hosted editor wrapper', () => {
  it('auto-boots embedGithubProject with the tagged tree, Focused file, and theme', async () => {
    const entry = shippingEntries().find(item => item.slug === BASIC_WRITING_SLUG)!
    const embed = vi.fn(async () => ({}))
    render(PlaygroundApp, {
      locale: 'en',
      slug: BASIC_WRITING_SLUG,
      theme: 'light',
      embed,
    })
    await waitFor(() => expect(embed).toHaveBeenCalledTimes(1))
    const [element, projectPath, options] = embed.mock.calls[0]!
    expect(element).toBeInstanceOf(HTMLElement)
    expect(projectPath).toBe(githubImportPath(entry))
    expect(options).toMatchObject({
      openFile: entry.focusedFile,
      clickToLoad: false,
      theme: 'light',
      height: '100%',
    })
  })

  it('replaces a failed boot with Open in StackBlitz in place', async () => {
    const embed = vi.fn(async () => {
      throw new Error('blocked')
    })
    const view = render(PlaygroundApp, {
      locale: 'en',
      slug: BASIC_WRITING_SLUG,
      embed,
    })
    await waitFor(() => {
      expect(
        within(view.getByRole('region', { name: 'Hosted editor' })).getByRole('link', {
          name: 'Open in StackBlitz',
        }),
      ).toBeTruthy()
    })
    const fallback = within(view.getByRole('region', { name: 'Hosted editor' })).getByRole(
      'link',
      { name: 'Open in StackBlitz' },
    )
    expect(fallback.getAttribute('href')).toBe(
      `https://stackblitz.com/fork/github/SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/default-theme`,
    )
    expect(fallback.getAttribute('target')).toBe('_blank')
    expect(view.getByRole('region', { name: 'Hosted editor' }).textContent).toMatch(
      /does not carry/i,
    )
    expect(view.container.textContent).not.toMatch(/Teams|paywall|Personal\+/i)
  })

  it('shows Search, PWA, Google Analytics, and Vite plugin success bars from the catalog', async () => {
    const embed = vi.fn(async () => ({}))
    const search = render(PlaygroundApp, { locale: 'en', slug: 'default-theme/search', embed })
    expect(search.getByText('Degraded')).toBeTruthy()
    expect(search.getByText('Observation-only')).toBeTruthy()
    expect(search.getByText(/Pagefind index/)).toBeTruthy()
    expect(search.getByText(/Docsearch \/ Meilisearch/)).toBeTruthy()
    cleanup()

    const pwa = render(PlaygroundApp, { locale: 'en', slug: 'default-theme/pwa', embed })
    expect(pwa.getByText('Observation-only')).toBeTruthy()
    expect(pwa.getByText('Degraded')).toBeTruthy()
    expect(pwa.getByText(/install prompt/)).toBeTruthy()
    expect(pwa.getByText(/preview-origin service worker/)).toBeTruthy()
    cleanup()

    const ga = render(PlaygroundApp, { locale: 'en', slug: 'default-theme/google-analytics', embed })
    expect(ga.getByText('Observation-only')).toBeTruthy()
    expect(ga.queryByText('Author-success')).toBeNull()
    cleanup()

    const vitePlugin = render(PlaygroundApp, { locale: 'en', slug: 'vite-plugin', embed })
    expect(vitePlugin.getByText('Author-success')).toBeTruthy()
    expect(vitePlugin.getByText('Observation-only')).toBeTruthy()
    expect(vitePlugin.getByText(/edit sveltepress/)).toBeTruthy()
    expect(vitePlugin.getByText(/llms, addInspect/)).toBeTruthy()
  })

  it('labels a Reference Entry strip as Reference, not Guide', async () => {
    const embed = vi.fn(async () => ({}))
    const view = render(PlaygroundApp, { locale: 'en', slug: 'vite-plugin', embed })
    const docsLink = view.getByRole('link', { name: 'Reference' })
    expect(docsLink.getAttribute('href')).toBe('/reference/vite-plugin/')
    expect(view.queryByRole('link', { name: 'Guide' })).toBeNull()
  })

  it('auto-boots Navbar at config/navbar.js on the tagged Default Theme starter', async () => {
    const entry = shippingEntries().find(item => item.slug === 'default-theme/navbar')!
    const embed = vi.fn(async () => ({}))
    render(PlaygroundApp, {
      locale: 'en',
      slug: 'default-theme/navbar',
      theme: 'dark',
      embed,
    })
    await waitFor(() => expect(embed).toHaveBeenCalledTimes(1))
    const [, projectPath, options] = embed.mock.calls[0]!
    expect(projectPath).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/default-theme`,
    )
    expect(options).toMatchObject({
      openFile: 'config/navbar.js',
      clickToLoad: false,
      theme: 'dark',
    })
  })
})
