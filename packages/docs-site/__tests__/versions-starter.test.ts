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
  VERSION_MANAGEMENT_SLUG,
} from '../src/lib/playground/catalog.ts'
import { hostedEditorEmbedRequest } from '../src/lib/playground/hosted-editor.ts'
import { shippingEntriesInGroup, shippingGroups } from '../src/lib/playground/shipping.ts'

describe('versions starter and Document versions', () => {
  it('ships Document versions as an Introduction Entry with CLI folded into the success bar', () => {
    const shipping = shippingEntries()
    expect(shipping.map(entry => entry.slug)).toContain(VERSION_MANAGEMENT_SLUG)
    expect(shipping.map(entry => entry.slug)).toContain(BASIC_WRITING_SLUG)
    expect(shipping.some(entry => entry.slug === KITCHEN_SINK_SLUG)).toBe(false)
    expect(shipping.some(entry => entry.name === 'SveltePress CLI')).toBe(false)
    expect(shippingGroups()).toContain('Introduction')
    expect(shippingGroups()).toContain('Markdown features')
    expect(shippingEntriesInGroup('Introduction').map(entry => entry.slug)).toContain(
      VERSION_MANAGEMENT_SLUG,
    )

    const entry = entryBySlug(VERSION_MANAGEMENT_SLUG)!
    expect(entry.name).toBe('Document versions')
    expect(entry.group).toBe('Introduction')
    expect(entry.success).toEqual(['as', 'degraded'])
    expect(entry.barNote).toBe('`versions init` / `create` · `versions build`')
    expect(entry.starter).toBe('Versions starter')
    expect(entry.focusedFile).toBe('sveltepress.versions.json')
    expect(entry.guideHref).toBe('/guide/version-management/')
    expect(STARTER_SUBDIRECTORIES[entry.starter]).toBe('versions')
  })

  it('registers locale-prefixed Document versions Entry URLs and leaves Kitchen sink unregistered', () => {
    expect(entryUrl(VERSION_MANAGEMENT_SLUG)).toBe('/playground/version-management/')
    expect(entryUrl(VERSION_MANAGEMENT_SLUG, 'zh')).toBe('/zh/playground/version-management/')
    expect(entryUrl(VERSION_MANAGEMENT_SLUG, 'bn')).toBe('/bn/playground/version-management/')
    expect(entryUrl(VERSION_MANAGEMENT_SLUG)).not.toContain('?')
    expect(isPlaygroundPathRegistered('/playground/version-management/')).toBe(true)
    expect(isPlaygroundPathRegistered('/zh/playground/version-management/')).toBe(true)
    expect(isPlaygroundPathRegistered('/bn/playground/version-management/')).toBe(true)
    expect(isPlaygroundPathRegistered('/playground/kitchen-sink/')).toBe(false)
    expect(isPlaygroundPathRegistered('/v/2026-09-03/playground/version-management/')).toBe(false)
  })

  it('addresses GitHub import and Open in StackBlitz at the pinned tag plus versions', () => {
    const entry = entryBySlug(VERSION_MANAGEMENT_SLUG)!
    expect(PINNED_STARTERS_TAG).not.toBe('main')
    expect(githubImportPath(entry)).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/versions`,
    )
    expect(openInStackBlitzUrl(entry)).toBe(
      `https://stackblitz.com/fork/github/SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/versions`,
    )
    expect(githubImportPath(entry)).not.toContain('/main/')
    expect(JSON.stringify(entry)).not.toMatch(/stackblitz\.com\/edit/)
    expect(entry).not.toHaveProperty('stackblitzProjectId')
  })

  it('auto-boots the Hosted editor as authored at sveltepress.versions.json', () => {
    const entry = entryBySlug(VERSION_MANAGEMENT_SLUG)!
    const request = hostedEditorEmbedRequest(entry, 'light')
    expect(request.method).toBe('embedGithubProject')
    expect(request.projectPath).toBe(
      `SveltePress/playground-starters/tree/${PINNED_STARTERS_TAG}/versions`,
    )
    expect(request.options.openFile).toBe('sveltepress.versions.json')
    expect(request.options.clickToLoad).toBe(false)
    expect(request.options.theme).toBe('light')
    expect(JSON.stringify(request)).not.toMatch(/embedProject/)
    expect(JSON.stringify(request)).not.toMatch(/\/run/)
  })

  it('localizes Document versions from the matching docs locale titles', () => {
    const entry = entryBySlug(VERSION_MANAGEMENT_SLUG)!
    expect(localizedName(entry, 'en')).toBe('Document versions')
    expect(localizedName(entry, 'zh')).toBe('文档版本管理')
    expect(localizedName(entry, 'bn')).toBe('ডকুমেন্ট সংস্করণ ব্যবস্থাপনা')
  })

  it('exposes Open in Playground on the Document versions Guide leaf', () => {
    expect(openInPlayground('/guide/version-management/')).toEqual({
      visible: true,
      href: '/playground/version-management/',
    })
    expect(openInPlayground('/zh/guide/version-management/')).toEqual({
      visible: true,
      href: '/zh/playground/version-management/',
    })
    expect(openInPlayground('/bn/guide/version-management/')).toEqual({
      visible: true,
      href: '/bn/playground/version-management/',
    })
  })

  it('registers EN/ZH/BN Document versions Entry pages and no Kitchen-sink route', () => {
    const routes = resolve(import.meta.dirname, '../src/routes')
    expect(existsSync(resolve(routes, 'playground/version-management/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'zh/playground/version-management/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'bn/playground/version-management/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'playground/kitchen-sink/+page.svelte'))).toBe(false)
  })
})
