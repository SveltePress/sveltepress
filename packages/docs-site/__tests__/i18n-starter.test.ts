import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  BASIC_WRITING_SLUG,
  entryBySlug,
  entryUrl,
  githubImportPath,
  I18N_SLUG,
  isPlaygroundPathRegistered,
  KITCHEN_SINK_SLUG,
  localizedName,
  openInPlayground,
  openInStackBlitzUrl,
  PINNED_STARTERS_TAG,
  shippingEntries,
  STARTER_SUBDIRECTORIES,
} from '../src/lib/playground/catalog.ts'
import { hostedEditorEmbedRequest } from '../src/lib/playground/hosted-editor.ts'
import { shippingGroups } from '../src/lib/playground/shipping.ts'

describe('i18n starter and Internationalization', () => {
  it('ships Internationalization as an Introduction Entry beside Basic Writing', () => {
    const shipping = shippingEntries()
    expect(shipping.map(entry => entry.slug)).toContain(I18N_SLUG)
    expect(shipping.map(entry => entry.slug)).toContain(BASIC_WRITING_SLUG)
    expect(shipping.some(entry => entry.slug === KITCHEN_SINK_SLUG)).toBe(true)
    expect(shippingGroups()).toContain('Introduction')
    expect(shippingGroups()).toContain('Markdown features')
    expect(shippingGroups()).toContain('All features')

    const entry = entryBySlug(I18N_SLUG)!
    expect(entry.name).toBe('Internationalization')
    expect(entry.group).toBe('Introduction')
    expect(entry.starter).toBe('i18n starter')
    expect(entry.focusedFile).toBe('config/locales.ts')
    expect(entry.guideHref).toBe('/guide/i18n/')
    expect(entry.success).toEqual(['as'])
    expect(STARTER_SUBDIRECTORIES[entry.starter]).toBe('i18n')
  })

  it('registers locale-prefixed Internationalization Entry URLs', () => {
    expect(entryUrl(I18N_SLUG)).toBe('/playground/i18n/')
    expect(entryUrl(I18N_SLUG, 'zh')).toBe('/zh/playground/i18n/')
    expect(entryUrl(I18N_SLUG, 'bn')).toBe('/bn/playground/i18n/')
    expect(entryUrl(I18N_SLUG)).not.toContain('?')
    expect(isPlaygroundPathRegistered('/playground/i18n/')).toBe(true)
    expect(isPlaygroundPathRegistered('/zh/playground/i18n/')).toBe(true)
    expect(isPlaygroundPathRegistered('/bn/playground/i18n/')).toBe(true)
    expect(isPlaygroundPathRegistered('/playground/kitchen-sink/')).toBe(true)
    expect(isPlaygroundPathRegistered('/v/2026-09-03/playground/i18n/')).toBe(false)
  })

  it('addresses GitHub import and Open in StackBlitz at the pinned tag plus i18n', () => {
    const entry = entryBySlug(I18N_SLUG)!
    expect(PINNED_STARTERS_TAG).not.toBe('main')
    expect(githubImportPath(entry)).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/i18n`,
    )
    expect(openInStackBlitzUrl(entry)).toBe(
      `https://stackblitz.com/fork/github/SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/i18n`,
    )
    expect(githubImportPath(entry)).not.toContain('/main/')
    expect(githubImportPath(entry)).not.toContain('/kitchen-sink')
    expect(JSON.stringify(entry)).not.toMatch(/stackblitz\.com\/edit/)
    expect(entry).not.toHaveProperty('stackblitzProjectId')
  })

  it('auto-boots the Hosted editor as authored at config/locales.ts', () => {
    const entry = entryBySlug(I18N_SLUG)!
    const request = hostedEditorEmbedRequest(entry, 'light')
    expect(request.method).toBe('embedGithubProject')
    expect(request.projectPath).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/i18n`,
    )
    expect(request.options.openFile).toBe('config/locales.ts')
    expect(request.options.clickToLoad).toBe(false)
    expect(request.options.theme).toBe('light')
    expect(JSON.stringify(request)).not.toMatch(/embedProject/)
    expect(JSON.stringify(request)).not.toMatch(/\/run/)
  })

  it('localizes Internationalization from the matching docs locale titles', () => {
    const entry = entryBySlug(I18N_SLUG)!
    expect(localizedName(entry, 'en')).toBe('Internationalization')
    expect(localizedName(entry, 'zh')).toBe('国际化')
    expect(localizedName(entry, 'bn')).toBe('আন্তর্জাতিকীকরণ')
  })

  it('exposes Open in Playground on the Internationalization Guide leaf', () => {
    expect(openInPlayground('/guide/i18n/')).toEqual({
      visible: true,
      href: '/playground/i18n/',
    })
    expect(openInPlayground('/zh/guide/i18n/')).toEqual({
      visible: true,
      href: '/zh/playground/i18n/',
    })
    expect(openInPlayground('/bn/guide/i18n/')).toEqual({
      visible: true,
      href: '/bn/playground/i18n/',
    })
    expect(openInPlayground('/v/2026-09-03/guide/i18n/')).toEqual({
      visible: false,
      href: null,
    })
  })

  it('registers the Internationalization Entry URL in every locale', () => {
    const routes = resolve(import.meta.dirname, '../src/routes')
    expect(existsSync(resolve(routes, 'playground/i18n/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'zh/playground/i18n/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'bn/playground/i18n/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'playground/kitchen-sink/+page.svelte'))).toBe(true)
  })
})
