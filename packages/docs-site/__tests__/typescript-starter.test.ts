import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  BASIC_WRITING_SLUG,
  entryBySlug,
  entryUrl,
  githubImportPath,
  isPlaygroundPathRegistered,
  KITCHEN_SINK_SLUG,
  localizedName,
  openInPlayground,
  openInStackBlitzUrl,
  PINNED_STARTERS_TAG,
  shippingEntries,
  STARTER_SUBDIRECTORIES,
  TYPESCRIPT_SLUG,
} from '../src/lib/playground/catalog.ts'
import { hostedEditorEmbedRequest } from '../src/lib/playground/hosted-editor.ts'
import { shippingGroups } from '../src/lib/playground/shipping.ts'

describe('typescript starter and Working with TypeScript', () => {
  it('ships Working with TypeScript as an Introduction Entry beside Basic Writing', () => {
    const shipping = shippingEntries()
    expect(shipping.map(entry => entry.slug)).toContain(TYPESCRIPT_SLUG)
    expect(shipping.map(entry => entry.slug)).toContain(BASIC_WRITING_SLUG)
    expect(shipping.some(entry => entry.slug === KITCHEN_SINK_SLUG)).toBe(false)
    expect(shippingGroups()).toContain('Introduction')
    expect(shippingGroups()).not.toContain('All features')

    const entry = entryBySlug(TYPESCRIPT_SLUG)!
    expect(entry.name).toBe('Working with TypeScript')
    expect(entry.group).toBe('Introduction')
    expect(entry.starter).toBe('TypeScript starter')
    expect(entry.focusedFile).toBe('vite.config.ts')
    expect(entry.guideHref).toBe('/guide/typescript/')
    expect(STARTER_SUBDIRECTORIES[entry.starter]).toBe('typescript')
  })

  it('registers locale-prefixed TypeScript Entry URLs and leaves Kitchen sink unregistered', () => {
    expect(entryUrl(TYPESCRIPT_SLUG)).toBe('/playground/typescript/')
    expect(entryUrl(TYPESCRIPT_SLUG, 'zh')).toBe('/zh/playground/typescript/')
    expect(entryUrl(TYPESCRIPT_SLUG, 'bn')).toBe('/bn/playground/typescript/')
    expect(entryUrl(TYPESCRIPT_SLUG)).not.toContain('?')
    expect(isPlaygroundPathRegistered('/playground/typescript/')).toBe(true)
    expect(isPlaygroundPathRegistered('/zh/playground/typescript/')).toBe(true)
    expect(isPlaygroundPathRegistered('/bn/playground/typescript/')).toBe(true)
    expect(isPlaygroundPathRegistered('/playground/kitchen-sink/')).toBe(false)
    expect(isPlaygroundPathRegistered('/v/2026-09-03/playground/typescript/')).toBe(false)
  })

  it('addresses GitHub import and Open in StackBlitz at the pinned tag plus typescript', () => {
    const entry = entryBySlug(TYPESCRIPT_SLUG)!
    expect(PINNED_STARTERS_TAG).not.toBe('main')
    expect(githubImportPath(entry)).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/typescript`,
    )
    expect(openInStackBlitzUrl(entry)).toBe(
      `https://stackblitz.com/fork/github/SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/typescript`,
    )
    expect(githubImportPath(entry)).not.toContain('/main/')
    expect(githubImportPath(entry)).not.toContain('/kitchen-sink')
    expect(JSON.stringify(entry)).not.toMatch(/stackblitz\.com\/edit/)
    expect(entry).not.toHaveProperty('stackblitzProjectId')
  })

  it('auto-boots the Hosted editor as authored at vite.config.ts', () => {
    const entry = entryBySlug(TYPESCRIPT_SLUG)!
    const request = hostedEditorEmbedRequest(entry, 'dark')
    expect(request.method).toBe('embedGithubProject')
    expect(request.projectPath).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/typescript`,
    )
    expect(request.options.openFile).toBe('vite.config.ts')
    expect(request.options.clickToLoad).toBe(false)
    expect(request.options.theme).toBe('dark')
    expect(JSON.stringify(request)).not.toMatch(/embedProject/)
    expect(JSON.stringify(request)).not.toMatch(/\/run/)
  })

  it('localizes Working with TypeScript from the matching docs locale titles', () => {
    const entry = entryBySlug(TYPESCRIPT_SLUG)!
    expect(localizedName(entry, 'en')).toBe('Working with TypeScript')
    expect(localizedName(entry, 'zh')).toBe('与 Typescript 一起开发')
    expect(localizedName(entry, 'bn')).toBe('Typescript ব্যবহার')
  })

  it('exposes Open in Playground on the Working with TypeScript Guide leaf', () => {
    expect(openInPlayground('/guide/typescript/')).toEqual({
      visible: true,
      href: '/playground/typescript/',
    })
    expect(openInPlayground('/zh/guide/typescript/')).toEqual({
      visible: true,
      href: '/zh/playground/typescript/',
    })
    expect(openInPlayground('/bn/guide/typescript/')).toEqual({
      visible: true,
      href: '/bn/playground/typescript/',
    })
  })

  it('registers EN/ZH/BN TypeScript Entry pages and no Kitchen-sink route', () => {
    const routes = resolve(import.meta.dirname, '../src/routes')
    expect(existsSync(resolve(routes, 'playground/typescript/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'zh/playground/typescript/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'bn/playground/typescript/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'playground/kitchen-sink/+page.svelte'))).toBe(false)
  })
})
