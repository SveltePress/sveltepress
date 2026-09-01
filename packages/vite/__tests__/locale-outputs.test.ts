import type { Plugin } from 'vite'
import type { LocalesConfig } from '../src/types'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import { generateLlmsTxtForLocales } from '../src/llms'
import sveltepress from '../src/plugin'
import { generateLocaleSitemap } from '../src/sitemap'

const originalCwd = process.cwd()

afterEach(() => process.chdir(originalCwd))

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'sveltepress-locale-outputs-'))
  mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
  mkdirSync(join(root, 'src/routes/zh/guide'), { recursive: true })
  mkdirSync(join(root, 'src/routes/bn'), { recursive: true })
  writeFileSync(join(root, 'src/routes/guide/+page.md'), '---\ntitle: Guide\n---\nEnglish guide')
  writeFileSync(join(root, 'src/routes/zh/+page.md'), '---\ntitle: 首页\n---\n中文首页')
  writeFileSync(join(root, 'src/routes/zh/guide/+page.md'), '---\ntitle: 指南\n---\n中文指南')
  writeFileSync(join(root, 'src/routes/bn/+page.md'), '---\ntitle: হোম\n---\nবাংলা হোম')
  const locales: LocalesConfig = {
    '/': { lang: 'en', label: 'English', theme: {}, routes: ['/', '/guide/', '/en-only/'] },
    '/zh/': { lang: 'zh', label: '中文', theme: {}, routes: ['/', '/guide/'] },
    '/bn/': { lang: 'bn', label: 'বাংলা', theme: {}, routes: ['/'] },
  }
  return { root, locales }
}

describe('per-locale llms output', () => {
  it('writes one llms pair per locale at that locale root, listing only its pages', () => {
    const { root, locales } = fixture()
    generateLlmsTxtForLocales({ enabled: true, baseUrl: 'https://docs.example.com' }, { title: 'Docs' }, locales, null, root)
    const en = readFileSync(join(root, 'static/llms.txt'), 'utf8')
    const zh = readFileSync(join(root, 'static/zh/llms.txt'), 'utf8')
    const bn = readFileSync(join(root, 'static/bn/llms.txt'), 'utf8')
    const enFull = readFileSync(join(root, 'static/llms-full.txt'), 'utf8')
    expect(en).toContain('[Guide](https://docs.example.com/guide)')
    expect(en).not.toContain('/zh/')
    expect(en).not.toContain('首页')
    expect(zh).toContain('[首页](https://docs.example.com/zh/)')
    expect(zh).toContain('[指南](https://docs.example.com/zh/guide)')
    expect(zh).not.toContain('English guide')
    expect(zh).not.toContain('https://docs.example.com/guide)')
    expect(bn).toContain('[হোম](https://docs.example.com/bn/)')
    expect(bn).not.toContain('[Guide]')
    expect(enFull).toContain('English guide')
    expect(enFull).not.toContain('中文指南')
  })

  it('writes per-locale llms to a custom build directory', () => {
    const { root, locales } = fixture()
    const output = join(root, 'build-client')
    generateLlmsTxtForLocales({ enabled: true, baseUrl: 'https://docs.example.com' }, { title: 'Docs' }, locales, null, root, output)
    expect(readFileSync(join(output, 'zh/llms.txt'), 'utf8')).toContain('[指南](https://docs.example.com/zh/guide)')
    expect(readFileSync(join(output, 'llms.txt'), 'utf8')).toContain('[Guide](https://docs.example.com/guide)')
  })
})

describe('hreflang sitemap output', () => {
  it('lists every locale version of each page with hreflang alternates', () => {
    const { root, locales } = fixture()
    generateLocaleSitemap(locales, root, 'https://docs.example.com')
    const sitemap = readFileSync(join(root, 'static/sitemap.xml'), 'utf8')
    expect(sitemap).toContain('<loc>https://docs.example.com/guide/</loc>')
    expect(sitemap).toContain('<loc>https://docs.example.com/zh/guide/</loc>')
    expect(sitemap).toContain('<loc>https://docs.example.com/bn/</loc>')
    expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    expect(sitemap).toContain('hreflang="zh" href="https://docs.example.com/zh/guide/"')
    expect(sitemap).toContain('hreflang="en" href="https://docs.example.com/guide/"')
    expect(sitemap).toContain('hreflang="bn" href="https://docs.example.com/bn/"')
  })

  it('only alternates locales that actually have the logical page', () => {
    const { root, locales } = fixture()
    generateLocaleSitemap(locales, root, 'https://docs.example.com')
    const sitemap = readFileSync(join(root, 'static/sitemap.xml'), 'utf8')
    const enOnly = sitemap.match(/<url>\s*<loc>https:\/\/docs\.example\.com\/en-only\/<\/loc>[\s\S]*?<\/url>/)?.[0]
    expect(enOnly).toBeTruthy()
    expect(enOnly).toContain('hreflang="en"')
    expect(enOnly).not.toContain('hreflang="zh"')
    expect(enOnly).not.toContain('hreflang="bn"')
  })

  it('writes the sitemap to a custom build directory', () => {
    const { root, locales } = fixture()
    const output = join(root, 'build-client')
    generateLocaleSitemap(locales, root, 'https://docs.example.com', output)
    expect(readFileSync(join(output, 'sitemap.xml'), 'utf8')).toContain('hreflang="zh"')
  })
})

describe('locale build outputs through the plugin', () => {
  it('writes per-locale llms and the hreflang sitemap during a build', async () => {
    const { root, locales } = fixture()
    process.chdir(root)
    const plugin = sveltepress({ locales, llms: { enabled: true, baseUrl: 'https://docs.example.com' } }) as Plugin
    await (plugin.configResolved as (config: unknown) => void)({ command: 'build', build: { ssr: false }, plugins: [] })
    await (plugin.writeBundle as (output: unknown) => void)({ dir: 'static' })
    expect(readFileSync(join(root, 'static/llms.txt'), 'utf8')).toContain('[Guide](https://docs.example.com/guide)')
    expect(readFileSync(join(root, 'static/zh/llms.txt'), 'utf8')).toContain('[指南](https://docs.example.com/zh/guide)')
    expect(readFileSync(join(root, 'static/sitemap.xml'), 'utf8')).toContain('hreflang="zh"')
    expect(readFileSync(join(root, 'static/sitemap.xml'), 'utf8')).toContain('<loc>https://docs.example.com/guide/</loc>')
  })
})
