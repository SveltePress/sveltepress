import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  BASIC_WRITING_SLUG,
  githubImportPath,
  shippingEntries,
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
  = 'The full Feature directory is 27 Entries. This cut proves the sandbox.'

describe('playground v1 catalog chrome', () => {
  it('lists one Markdown features group and one Basic Writing row', () => {
    const groups = shippingGroups()
    expect(groups).toEqual(['Markdown features'])
    expect(shippingEntries().map(entry => entry.slug)).toEqual([BASIC_WRITING_SLUG])
    expect(shippingEntries()[0]?.name).toBe('Basic Writing')
  })

  it('keeps the slice sentence in home copy and out of the Entry strip copy', () => {
    const copy = playgroundCopy('en')
    expect(copy.sliceSentence).toBe(SLICE_SENTENCE_EN)
    expect(copy.persistCaveat).toBe(PERSIST_CAVEAT_EN)
    expect(copy.persistCaveat).not.toContain('27 Entries')
    expect(copy.openInStackBlitz).toBe('Open in StackBlitz')
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
    expect(zh.persistCaveat).toContain('Save-fork')
    expect(bn.persistCaveat).toContain('Save-fork')
    expect(zh.openInStackBlitz).not.toMatch(/修改|编辑/)
    expect(localizedGroup('Markdown features', 'zh')).toBe('Markdown 相关')
    expect(localizedGroup('Markdown features', 'bn')).toBe('Markdown এর ফিচারসমূহ')
    expect(localizedGroup('Markdown features', 'en')).toBe('Markdown features')
  })

  it('registers only the shipping Entry URL and Playground home as files', () => {
    const routes = resolve(import.meta.dirname, '../src/routes')
    expect(existsSync(resolve(routes, 'playground/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'playground/markdown/basic-writing/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'zh/playground/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'zh/playground/markdown/basic-writing/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'bn/playground/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'bn/playground/markdown/basic-writing/+page.svelte'))).toBe(true)
    expect(existsSync(resolve(routes, 'playground/markdown/frontmatter/+page.svelte'))).toBe(false)
    expect(existsSync(resolve(routes, 'playground/kitchen-sink/+page.svelte'))).toBe(false)
    expect(existsSync(resolve(routes, 'v/playground/+page.svelte'))).toBe(false)
    expect(existsSync(resolve(routes, 'zh/v/playground/+page.svelte'))).toBe(false)
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
    const entry = shippingEntries()[0]!
    const request = hostedEditorEmbedRequest(entry, 'dark')
    expect(request.method).toBe('embedGithubProject')
    expect(request.projectPath).toBe(githubImportPath(entry))
    expect(request.projectPath).toContain('/tree/playground-v1/default-theme')
    expect(request.projectPath).not.toContain('/main/')
    expect(request.options.openFile).toBe('src/routes/guide/markdown/basic-writing/+page.md')
    expect(request.options.clickToLoad).toBe(false)
    expect(request.options.theme).toBe('dark')
    expect(request.options.height).toBe('100%')
    expect(JSON.stringify(request)).not.toMatch(/embedProject/)
    expect(JSON.stringify(request)).not.toMatch(/\/run/)
  })
})
