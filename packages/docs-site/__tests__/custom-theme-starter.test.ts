// @vitest-environment happy-dom

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, render, waitFor } from '@testing-library/svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CUSTOM_THEME_SLUG,
  entryBySlug,
  entryUrl,
  githubImportPath,
  isPlaygroundPathRegistered,
  KITCHEN_SINK_SLUG,
  openInPlayground,
  openInStackBlitzUrl,
  PINNED_STARTERS_TAG,
  shippingEntries,
} from '../src/lib/playground/catalog.ts'
import { hostedEditorEmbedRequest } from '../src/lib/playground/hosted-editor.ts'
import PlaygroundApp from '../src/lib/playground/PlaygroundApp.svelte'
import { shippingGroups } from '../src/lib/playground/shipping.ts'

afterEach(cleanup)

describe('custom theme starter and Entry', () => {
  it('ships Custom theme from Playground home', () => {
    const shipping = shippingEntries()
    expect(shipping.map(entry => entry.slug)).toContain(CUSTOM_THEME_SLUG)
    expect(shipping.some(entry => entry.slug === KITCHEN_SINK_SLUG)).toBe(true)
    expect(shippingGroups()).toContain('Introduction')
    expect(shipping.find(entry => entry.slug === CUSTOM_THEME_SLUG)?.name).toBe('Custom theme')
    expect(shipping.find(entry => entry.slug === CUSTOM_THEME_SLUG)?.starter).toBe('Custom theme starter')
  })

  it('registers Custom theme Entry URLs and leaves historical trees unregistered', () => {
    expect(isPlaygroundPathRegistered('/playground/custom-theme/')).toBe(true)
    expect(isPlaygroundPathRegistered('/zh/playground/custom-theme/')).toBe(true)
    expect(isPlaygroundPathRegistered('/bn/playground/custom-theme/')).toBe(true)
    expect(isPlaygroundPathRegistered('/v/2026-09-03/playground/custom-theme/')).toBe(false)
    expect(entryUrl(CUSTOM_THEME_SLUG)).toBe('/playground/custom-theme/')
    expect(entryUrl(CUSTOM_THEME_SLUG, 'zh')).toBe('/zh/playground/custom-theme/')
    expect(entryUrl(CUSTOM_THEME_SLUG, 'bn')).toBe('/bn/playground/custom-theme/')
    expect(entryUrl(CUSTOM_THEME_SLUG)).not.toContain('?')
  })

  it('addresses the tagged custom-theme subdirectory, not main or Kitchen-sink', () => {
    const entry = entryBySlug(CUSTOM_THEME_SLUG)!
    expect(entry.guideHref).toBeNull()
    expect(entry.starter).toBe('Custom theme starter')
    expect(entry.focusedFile).toBe('src/routes/+layout.svelte')
    expect(PINNED_STARTERS_TAG).not.toBe('main')
    expect(githubImportPath(entry)).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/custom-theme`,
    )
    expect(openInStackBlitzUrl(entry)).toBe(
      `https://stackblitz.com/fork/github/SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/custom-theme`,
    )
    expect(githubImportPath(entry)).not.toContain('/main/')
    expect(githubImportPath(entry)).not.toContain('/kitchen-sink')
  })

  it('keeps Open in Playground off for Custom theme because there is no Guide leaf', () => {
    expect(openInPlayground('/guide/custom-theme/')).toEqual({ visible: false, href: null })
    expect(openInPlayground('/zh/guide/custom-theme/')).toEqual({ visible: false, href: null })
    expect(openInPlayground('/guide/themes/')).toEqual({ visible: false, href: null })
    expect(openInPlayground('/guide/introduction/')).toEqual({ visible: false, href: null })
  })

  it('registers locale Entry pages for Custom theme', () => {
    const routes = resolve(import.meta.dirname, '../src/routes')
    expect(existsSync(resolve(routes, 'playground/custom-theme/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'zh/playground/custom-theme/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'bn/playground/custom-theme/+page.svelte'))).toBe(true)
  })

  it('auto-boots the Hosted editor at the theme root layout', () => {
    const entry = entryBySlug(CUSTOM_THEME_SLUG)!
    const request = hostedEditorEmbedRequest(entry, 'light')
    expect(request.method).toBe('embedGithubProject')
    expect(request.projectPath).toBe(githubImportPath(entry))
    expect(request.options.openFile).toBe('src/routes/+layout.svelte')
    expect(request.previewPath).toBe('/')
    expect(hostedEditorEmbedRequest(entry, 'light', 'zh').options.openFile)
      .toBe('src/routes/+layout.svelte')
    expect(hostedEditorEmbedRequest(entry, 'light', 'zh').previewPath).toBe('/')
    expect(hostedEditorEmbedRequest(entry, 'light', 'zh').projectPath).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/custom-theme-zh`,
    )
    expect(hostedEditorEmbedRequest(entry, 'light', 'bn').options.openFile)
      .toBe('src/routes/+layout.svelte')
    expect(hostedEditorEmbedRequest(entry, 'light', 'bn').previewPath).toBe('/')
    expect(hostedEditorEmbedRequest(entry, 'light', 'bn').projectPath).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/custom-theme-bn`,
    )
    expect(request.options.clickToLoad).toBe(false)
    expect(JSON.stringify(request)).not.toMatch(/embedProject/)
    expect(JSON.stringify(request)).not.toMatch(/\/run/)
  })

  it('renders the Custom theme strip without Guide and auto-boots the tagged tree', async () => {
    const embed = vi.fn(async () => ({}))
    const view = render(PlaygroundApp, {
      locale: 'en',
      slug: CUSTOM_THEME_SLUG,
      theme: 'dark',
      embed,
    })
    await waitFor(() => expect(embed).toHaveBeenCalledTimes(1))
    const [, projectPath, options] = embed.mock.calls[0]!
    expect(projectPath).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/custom-theme`,
    )
    expect(options).toMatchObject({
      openFile: 'src/routes/+layout.svelte',
      clickToLoad: false,
      theme: 'dark',
    })
    expect(view.queryByRole('link', { name: 'Guide' })).toBeNull()
    expect(view.getByRole('link', { name: 'Open in StackBlitz' }).getAttribute('href')).toBe(
      `https://stackblitz.com/fork/github/SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/custom-theme`,
    )
    const strip = view.container.querySelector('[data-pagefind-body]')
    expect(strip?.textContent).toContain('Custom theme')
    expect(view.getByRole('region', { name: 'Hosted editor' }).getAttribute('data-pagefind-ignore')).toBe('all')
  })
})
