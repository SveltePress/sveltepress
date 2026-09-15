// @vitest-environment happy-dom

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, render, waitFor } from '@testing-library/svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import bnNavbar from '../config/bn/navbar.ts'
import enNavbar from '../config/navbar.ts'
import zhNavbar from '../config/zh/navbar.ts'
import {
  BASIC_WRITING_SLUG,
  CUSTOM_THEME_SLUG,
  entryBySlug,
  entryUrl,
  githubImportPath,
  isPlaygroundPathRegistered,
  KITCHEN_SINK_SLUG,
  kitchenSinkCtaHref,
  localizedName,
  openInPlayground,
  openInPlaygroundHref,
  openInStackBlitzUrl,
  PINNED_STARTERS_TAG,
  shippingEntries,
  STARTER_SUBDIRECTORIES,
  VIRTUAL_MODULES_SLUG,
} from '../src/lib/playground/catalog.ts'
import { playgroundCopy } from '../src/lib/playground/copy.ts'
import { hostedEditorEmbedRequest } from '../src/lib/playground/hosted-editor.ts'
import PlaygroundApp from '../src/lib/playground/PlaygroundApp.svelte'
import { shippingEntriesInGroup, shippingGroups } from '../src/lib/playground/shipping.ts'

afterEach(cleanup)

describe('kitchen-sink starter, Virtual modules, and Kitchen-sink CTA', () => {
  it('ships Kitchen sink as the All features Entry on the Kitchen-sink starter', () => {
    const shipping = shippingEntries()
    expect(shipping.map(entry => entry.slug)).toContain(KITCHEN_SINK_SLUG)
    expect(shipping.map(entry => entry.slug)).toContain(BASIC_WRITING_SLUG)
    expect(shippingGroups()).toContain('All features')
    expect(shippingEntriesInGroup('All features').map(entry => entry.slug)).toEqual([
      KITCHEN_SINK_SLUG,
    ])

    const entry = entryBySlug(KITCHEN_SINK_SLUG)!
    expect(entry.name).toBe('Kitchen sink')
    expect(entry.group).toBe('All features')
    expect(entry.success).toEqual(['as', 'degraded', 'observation'])
    expect(entry.barNote).toBe('coexistable Default Theme set')
    expect(entry.starter).toBe('Kitchen-sink starter')
    expect(entry.focusedFile).toBe('src/routes/+page.md')
    expect(entry.guideHref).toBeNull()
    expect(STARTER_SUBDIRECTORIES[entry.starter]).toBe('kitchen-sink')
    expect(entry.starter).not.toBe('TypeScript starter')
    expect(entry.starter).not.toBe('Blog starter')
    expect(entry.starter).not.toBe('Custom theme starter')
  })

  it('ships Virtual modules as one Reference Entry on the Kitchen-sink starter', () => {
    const shipping = shippingEntries()
    expect(shipping.map(entry => entry.slug)).toContain(VIRTUAL_MODULES_SLUG)
    expect(shipping.filter(entry => entry.starter === 'Kitchen-sink starter').map(entry => entry.slug)).toEqual([
      VIRTUAL_MODULES_SLUG,
      KITCHEN_SINK_SLUG,
    ])

    const entry = entryBySlug(VIRTUAL_MODULES_SLUG)!
    expect(entry.name).toBe('Virtual modules')
    expect(entry.group).toBe('Reference')
    expect(entry.success).toEqual(['as'])
    expect(entry.starter).toBe('Kitchen-sink starter')
    expect(entry.focusedFile).toBe('src/routes/reference/virtual-modules/+page.md')
    expect(entry.guideHref).toBe('/reference/site/')
    expect(STARTER_SUBDIRECTORIES[entry.starter]).toBe('kitchen-sink')
  })

  it('registers locale-prefixed Kitchen sink and Virtual modules Entry URLs', () => {
    expect(entryUrl(KITCHEN_SINK_SLUG)).toBe('/playground/kitchen-sink/')
    expect(entryUrl(KITCHEN_SINK_SLUG, 'zh')).toBe('/zh/playground/kitchen-sink/')
    expect(entryUrl(KITCHEN_SINK_SLUG, 'bn')).toBe('/bn/playground/kitchen-sink/')
    expect(entryUrl(VIRTUAL_MODULES_SLUG)).toBe('/playground/virtual-modules/')
    expect(entryUrl(VIRTUAL_MODULES_SLUG, 'zh')).toBe('/zh/playground/virtual-modules/')
    expect(entryUrl(VIRTUAL_MODULES_SLUG, 'bn')).toBe('/bn/playground/virtual-modules/')
    expect(entryUrl(KITCHEN_SINK_SLUG)).not.toContain('?')
    expect(isPlaygroundPathRegistered('/playground/kitchen-sink/')).toBe(true)
    expect(isPlaygroundPathRegistered('/zh/playground/kitchen-sink/')).toBe(true)
    expect(isPlaygroundPathRegistered('/bn/playground/kitchen-sink/')).toBe(true)
    expect(isPlaygroundPathRegistered('/playground/virtual-modules/')).toBe(true)
    expect(isPlaygroundPathRegistered('/zh/playground/virtual-modules/')).toBe(true)
    expect(isPlaygroundPathRegistered('/bn/playground/virtual-modules/')).toBe(true)
    expect(isPlaygroundPathRegistered('/v/2026-09-03/playground/kitchen-sink/')).toBe(false)
    expect(isPlaygroundPathRegistered('/zh/v/2026-09-03/playground/virtual-modules/')).toBe(false)
  })

  it('addresses GitHub import and Open in StackBlitz at the pinned tag plus kitchen-sink', () => {
    const kitchen = entryBySlug(KITCHEN_SINK_SLUG)!
    const virtual = entryBySlug(VIRTUAL_MODULES_SLUG)!
    expect(PINNED_STARTERS_TAG).not.toBe('main')
    expect(githubImportPath(kitchen)).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/kitchen-sink`,
    )
    expect(githubImportPath(virtual)).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/kitchen-sink`,
    )
    expect(openInStackBlitzUrl(kitchen)).toBe(
      `https://stackblitz.com/fork/github/SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/kitchen-sink`,
    )
    expect(githubImportPath(kitchen)).not.toContain('/main/')
    expect(githubImportPath(kitchen)).not.toContain('/typescript')
    expect(JSON.stringify(kitchen)).not.toMatch(/stackblitz\.com\/edit/)
    expect(kitchen).not.toHaveProperty('stackblitzProjectId')
  })

  it('auto-boots Kitchen sink at the home page and Virtual modules at the catalog Focused file', () => {
    const kitchen = hostedEditorEmbedRequest(entryBySlug(KITCHEN_SINK_SLUG)!, 'light')
    expect(kitchen.method).toBe('embedGithubProject')
    expect(kitchen.projectPath).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/kitchen-sink`,
    )
    expect(kitchen.options.openFile).toBe('src/routes/+page.md')
    expect(kitchen.options.clickToLoad).toBe(false)
    expect(JSON.stringify(kitchen)).not.toMatch(/embedProject/)
    expect(JSON.stringify(kitchen)).not.toMatch(/\/run/)

    const virtual = hostedEditorEmbedRequest(entryBySlug(VIRTUAL_MODULES_SLUG)!, 'dark')
    expect(virtual.projectPath).toBe(kitchen.projectPath)
    expect(virtual.options.openFile).toBe('src/routes/reference/virtual-modules/+page.md')
    expect(virtual.options.clickToLoad).toBe(false)
    expect(virtual.options.theme).toBe('dark')
  })

  it('pins playground-v1.10 so Virtual modules writes Svelte in markdown', () => {
    expect(PINNED_STARTERS_TAG).toBe('playground-v1.10')
  })

  it('keeps svelte live on docs virtual-module pages and writes Svelte in the playground focused file', () => {
    const routes = resolve(import.meta.dirname, '../src/routes')
    const docsLeaves = [
      'reference/site/+page.md',
      'reference/locale/+page.md',
      'reference/versions/+page.md',
      'zh/reference/site/+page.md',
      'zh/reference/locale/+page.md',
      'zh/reference/versions/+page.md',
      'bn/reference/site/+page.md',
      'bn/reference/locale/+page.md',
      'bn/reference/versions/+page.md',
    ]

    for (const leaf of docsLeaves) {
      const page = readFileSync(resolve(routes, leaf), 'utf8')
      expect(page).toContain('```svelte live')
      expect(page).toMatch(/JsonViewer/)
    }

    const enSite = readFileSync(resolve(routes, 'reference/site/+page.md'), 'utf8')
    expect(enSite).toMatch(/writes Svelte in markdown/)
    expect(enSite).toMatch(/keeps svelte live so it can show the source next to the rendered result/)
  })

  it('opens virtual-module reference leaves on the one Virtual modules Entry URL', () => {
    expect(openInPlayground('/reference/site/')).toEqual({
      visible: true,
      href: '/playground/virtual-modules/',
    })
    expect(openInPlayground('/zh/reference/locale/')).toEqual({
      visible: true,
      href: '/zh/playground/virtual-modules/',
    })
    expect(openInPlayground('/bn/reference/versions/')).toEqual({
      visible: true,
      href: '/bn/playground/virtual-modules/',
    })
    expect(openInPlaygroundHref('/reference/site/')).toBe('/playground/virtual-modules/')
    expect(openInPlaygroundHref('/zh/reference/locale/')).toBe('/zh/playground/virtual-modules/')
    expect(openInPlaygroundHref('/bn/reference/versions/')).toBe('/bn/playground/virtual-modules/')
    expect(openInPlayground('/v/2026-09-03/reference/site/')).toEqual({
      visible: false,
      href: null,
    })
  })

  it('exposes a Kitchen-sink CTA href for Playground chrome and not the site Navbar', () => {
    expect(kitchenSinkCtaHref()).toBe('/playground/kitchen-sink/')
    expect(kitchenSinkCtaHref('zh')).toBe('/zh/playground/kitchen-sink/')
    expect(kitchenSinkCtaHref('bn')).toBe('/bn/playground/kitchen-sink/')
    expect(playgroundCopy('en').kitchenSinkCta.title).toBe('Kitchen sink')
    expect(playgroundCopy('en').kitchenSinkCta.kicker).toBe('All features')
    expect(playgroundCopy('en').kitchenSinkCta.hint).toMatch(/coexist/i)
    expect(playgroundCopy('zh').kitchenSinkCta.title).toBe('Kitchen sink')
    expect(playgroundCopy('bn').kitchenSinkCta.title).toBe('Kitchen sink')

    for (const navbar of [enNavbar, zhNavbar, bnNavbar]) {
      expect(navbar.some(item => item.to === '/playground/kitchen-sink/')).toBe(false)
      expect(JSON.stringify(navbar)).not.toMatch(/kitchen-sink/i)
    }
  })

  it('localizes Virtual modules from the matching docs locale titles', () => {
    expect(localizedName(entryBySlug(VIRTUAL_MODULES_SLUG)!, 'en')).toBe('Virtual modules')
    expect(localizedName(entryBySlug(VIRTUAL_MODULES_SLUG)!, 'zh')).toBe('虚拟模块')
    expect(localizedName(entryBySlug(VIRTUAL_MODULES_SLUG)!, 'bn')).toBe('ভার্চুয়াল মডিউল')
    expect(localizedName(entryBySlug(KITCHEN_SINK_SLUG)!, 'en')).toBe('Kitchen sink')
  })

  it('registers EN/ZH/BN Kitchen sink and Virtual modules Entry pages', () => {
    const routes = resolve(import.meta.dirname, '../src/routes')
    for (const slug of [KITCHEN_SINK_SLUG, VIRTUAL_MODULES_SLUG]) {
      expect(existsSync(resolve(routes, `playground/${slug}/+page.svelte`))).toBe(true)
      expect(existsSync(resolve(routes, `zh/playground/${slug}/+page.svelte`))).toBe(true)
      expect(existsSync(resolve(routes, `bn/playground/${slug}/+page.svelte`))).toBe(true)
    }
  })

  it('renders the Kitchen-sink CTA banner on Playground home and every Entry', async () => {
    const embed = vi.fn(async () => ({}))
    const home = render(PlaygroundApp, { locale: 'en', embed })
    const homeCtas = home.getAllByRole('link', { name: /kitchen sink/i })
    expect(homeCtas[0]?.getAttribute('href')).toBe('/playground/kitchen-sink/')
    expect(homeCtas[0]?.textContent).toContain('All features')
    expect(homeCtas[0]?.textContent).toContain('Kitchen sink')
    cleanup()

    const entry = render(PlaygroundApp, {
      locale: 'en',
      slug: BASIC_WRITING_SLUG,
      embed,
    })
    await waitFor(() => expect(embed).toHaveBeenCalled())
    const entryCta = entry.getAllByRole('link', { name: /kitchen sink/i })
    expect(entryCta[0]?.getAttribute('href')).toBe('/playground/kitchen-sink/')
    expect(entry.queryByRole('link', { name: 'Guide' })).toBeTruthy()
    cleanup()

    const custom = render(PlaygroundApp, {
      locale: 'en',
      slug: CUSTOM_THEME_SLUG,
      embed,
    })
    expect(custom.getAllByRole('link', { name: /kitchen sink/i })[0]?.getAttribute('href')).toBe(
      '/playground/kitchen-sink/',
    )
    expect(custom.queryByRole('link', { name: 'Guide' })).toBeNull()
  })

  it('auto-boots the tagged kitchen-sink tree from the Kitchen sink Entry URL', async () => {
    const embed = vi.fn(async () => ({}))
    const view = render(PlaygroundApp, {
      locale: 'en',
      slug: KITCHEN_SINK_SLUG,
      theme: 'dark',
      embed,
    })
    await waitFor(() => expect(embed).toHaveBeenCalledTimes(1))
    const [, projectPath, options] = embed.mock.calls[0]!
    expect(projectPath).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/kitchen-sink`,
    )
    expect(options).toMatchObject({
      openFile: 'src/routes/+page.md',
      clickToLoad: false,
      theme: 'dark',
    })
    expect(view.getByText('Author-success')).toBeTruthy()
    expect(view.getByText('Degraded')).toBeTruthy()
    expect(view.getByText('Observation-only')).toBeTruthy()
    expect(view.getByText('coexistable Default Theme set')).toBeTruthy()
    expect(view.queryByRole('link', { name: 'Guide' })).toBeNull()
    const kitchenLinks = view.getAllByRole('link', { name: /kitchen sink/i })
    expect(kitchenLinks.every(link => link.getAttribute('href') === '/playground/kitchen-sink/')).toBe(true)
    expect(kitchenLinks.some(link => link.getAttribute('aria-label') === 'Kitchen sink')).toBe(true)
    expect(view.getByRole('link', { name: 'Open in StackBlitz' }).getAttribute('href')).toBe(
      `https://stackblitz.com/fork/github/SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/kitchen-sink`,
    )
  })
})
