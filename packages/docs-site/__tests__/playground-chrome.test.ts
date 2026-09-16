import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  applyIsolationHeaders,
  isolationHeaders,
} from '../src/lib/isolation-headers.ts'
import {
  BASIC_WRITING_SLUG,
  entryBySlug,
  githubImportPath,
  PINNED_STARTERS_TAG,
  shippingEntries,
  TYPESCRIPT_SLUG,
} from '../src/lib/playground/catalog.ts'
import {
  localizedGroup,
  playgroundCopy,
} from '../src/lib/playground/copy.ts'
import {
  hostedEditorEmbedRequest,
} from '../src/lib/playground/hosted-editor.ts'
import { shippingGroups } from '../src/lib/playground/shipping.ts'

const PERSIST_CAVEAT_EN
  = 'Reloading or opening this URL always boots the Starter as authored. Keep edits with Save-fork in StackBlitz chrome. Open in StackBlitz opens the Starter as authored in a new tab and does not carry Hosted editor edits.'

const SLICE_SENTENCE_EN
  = 'The full Feature directory is 27 Entries. This list is every currently shipping Entry.'

describe('playground catalog chrome', () => {
  it('lists Markdown features, Default theme features, and Reference in Guide order', () => {
    const groups = shippingGroups()
    expect(groups).toContain('Introduction')
    expect(groups).toContain('Markdown features')
    expect(groups).toContain('Default theme features')
    expect(groups).toContain('Reference')
    const slugs = shippingEntries().map(entry => entry.slug)
    expect(slugs).toContain(BASIC_WRITING_SLUG)
    expect(slugs).toContain('default-theme/navbar')
    expect(slugs).toContain('vite-plugin')
    expect(slugs).toContain(TYPESCRIPT_SLUG)
    expect(slugs).toContain('version-management')
    expect(shippingEntries().find(entry => entry.slug === TYPESCRIPT_SLUG)?.name).toBe('Working with TypeScript')
    expect(shippingEntries().some(entry => entry.slug === 'kitchen-sink')).toBe(true)
    expect(shippingEntries().some(entry => entry.slug === 'virtual-modules')).toBe(true)
    expect(groups).toContain('All features')
    expect(shippingEntries().some(entry => entry.slug === 'i18n')).toBe(true)
    expect(groups).toContain('Blog theme features')
    expect(slugs).toEqual(expect.arrayContaining([
      'blog-theme/configuration',
      'blog-theme/writing-posts',
      'blog-theme/features',
      'blog-theme/customization',
    ]))
  })

  it('keeps the slice sentence in home copy and out of the Entry strip copy', () => {
    const copy = playgroundCopy('en')
    expect(copy.sliceSentence).toBe(SLICE_SENTENCE_EN)
    expect(copy.sliceSentence).not.toMatch(/sandbox|this cut/i)
    expect(copy.persistCaveat).toBe(PERSIST_CAVEAT_EN)
    expect(copy.persistCaveat).not.toContain('27 Entries')
    expect(copy.openInPlayground).toBe('Open in Playground')
    expect(copy.openInStackBlitz).toBe('Open in StackBlitz')
    expect(copy.retry).toBe('Retry')
    expect(copy.openInStackBlitz.toLowerCase()).not.toContain('edit')
    expect(copy.openInStackBlitz.toLowerCase()).not.toContain('changes')
  })

  it('translates Feature directory chrome for ZH and BN', () => {
    const zh = playgroundCopy('zh')
    const bn = playgroundCopy('bn')
    expect(zh.playground).toBe('演练场')
    expect(bn.playground).toBe('প্লেগ্রাউন্ড')
    expect(zh.sliceSentence).toContain('27')
    expect(bn.sliceSentence).toContain('27')
    expect(zh.sliceSentence).not.toContain('切片')
    expect(bn.sliceSentence).not.toContain('স্যান্ডবক্স')
    expect(zh.persistCaveat).toContain('Save-fork')
    expect(bn.persistCaveat).toContain('Save-fork')
    expect(zh.retry).toBe('重试')
    expect(bn.retry).toBe('আবার চেষ্টা করুন')
    expect(zh.openInStackBlitz).not.toMatch(/修改|编辑/)
    expect(localizedGroup('Markdown features', 'zh')).toBe('Markdown 相关')
    expect(localizedGroup('Markdown features', 'bn')).toBe('Markdown এর ফিচারসমূহ')
    expect(localizedGroup('Markdown features', 'en')).toBe('Markdown features')
    expect(localizedGroup('Default theme features', 'zh')).toBe('默认主题特性')
    expect(localizedGroup('Default theme features', 'bn')).toBe('ডিফল্ট থিমের ফিচারসমূহ')
    expect(localizedGroup('Reference', 'zh')).toBe('参考')
    expect(localizedGroup('Reference', 'bn')).toBe('রেফারেন্স')
  })

  it('registers shipping Entry URLs and Playground home as files', () => {
    const routes = resolve(import.meta.dirname, '../src/routes')
    expect(existsSync(resolve(routes, 'playground/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'zh/playground/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'bn/playground/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'playground/typescript/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'zh/playground/typescript/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'bn/playground/typescript/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'playground/i18n/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'zh/playground/i18n/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'bn/playground/i18n/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'playground/version-management/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'zh/playground/version-management/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'bn/playground/version-management/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'playground/kitchen-sink/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'zh/playground/kitchen-sink/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'bn/playground/kitchen-sink/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'playground/virtual-modules/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'v/playground/+page.svelte'))).toBe(false)
    expect(existsSync(resolve(routes, 'zh/v/playground/+page.svelte'))).toBe(false)
    expect(existsSync(resolve(routes, '../src/lib/prototype/open-in-playground'))).toBe(false)
  })

  it('wires Open in Playground from the catalog, not a prototype overlay', () => {
    const layout = readFileSync(
      resolve(import.meta.dirname, '../src/routes/+layout.svelte'),
      'utf8',
    )
    expect(layout).toContain('openInPlaygroundTitleAction')
    expect(layout).toContain('TITLE_ROW_ACTION_KEY')
    expect(layout).not.toContain('mountAt')
    expect(layout).not.toMatch(/prototype/i)
  })

  it('keeps Playground routes out of future documentation freezes', () => {
    const site = resolve(import.meta.dirname, '..')
    for (const name of [
      'sveltepress.versions.json',
      'sveltepress.versions.zh.json',
      'sveltepress.versions.bn.json',
    ]) {
      const manifest = JSON.parse(readFileSync(resolve(site, name), 'utf8')) as {
        content: { exclude: string[] }
      }
      expect(manifest.content.exclude).toContain('playground/**')
    }
  })
})

describe('hosted editor addressing', () => {
  it('asks embedGithubProject for the tagged subdirectory, Focused file, auto-boot, and theme', () => {
    const entry = entryBySlug(BASIC_WRITING_SLUG)!
    const request = hostedEditorEmbedRequest(entry, 'dark')
    expect(request.method).toBe('embedGithubProject')
    expect(request.projectPath).toBe(githubImportPath(entry))
    expect(PINNED_STARTERS_TAG).not.toBe('main')
    expect(request.projectPath).toContain(`/tree/${PINNED_STARTERS_TAG}/default-theme`)
    expect(request.projectPath).not.toContain('/main/')
    expect(request.options.openFile).toBe('src/routes/guide/markdown/basic-writing/+page.md')
    expect(request.options.clickToLoad).toBe(false)
    expect(request.options.theme).toBe('dark')
    expect(request.options.height).toBe('100%')
    expect(request.options.crossOriginIsolated).toBe(true)
    expect(JSON.stringify(request)).not.toMatch(/embedProject/)
    expect(JSON.stringify(request)).not.toMatch(/\/run/)
  })
})

describe('hosted editor isolation', () => {
  it('stamps COOP/COEP onto the resolved document response', () => {
    const headers = new Headers()
    applyIsolationHeaders(headers)
    expect(headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin')
    expect(headers.get('Cross-Origin-Embedder-Policy')).toBe('credentialless')
    expect(isolationHeaders).toEqual({
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    })
  })

  it('serves COOP/COEP on every document so client navigation keeps SharedArrayBuffer', () => {
    const site = resolve(import.meta.dirname, '..')
    const viteConfig = readFileSync(resolve(site, 'vite.config.ts'), 'utf8')
    const hooks = readFileSync(resolve(site, 'src/hooks.server.js'), 'utf8')
    const netlifyConfig = readFileSync(resolve(site, 'netlify.toml'), 'utf8')
    const publishedHeaders = readFileSync(resolve(site, 'static/_headers'), 'utf8')

    expect(viteConfig).toContain('./src/lib/isolation-headers.ts')
    expect(viteConfig).toMatch(/server:\s*\{[\s\S]*headers:\s*isolationHeaders/)
    expect(viteConfig).toMatch(/preview:\s*\{[\s\S]*headers:\s*isolationHeaders/)
    expect(hooks).toContain('sequence(isolationHandle, createLocaleHandle(locales))')

    for (const [name, value] of Object.entries(isolationHeaders)) {
      expect(publishedHeaders).toContain(`${name}: ${value}`)
      expect(netlifyConfig).toContain(name)
      expect(netlifyConfig).toContain(`"${value}"`)
    }
  })
})
