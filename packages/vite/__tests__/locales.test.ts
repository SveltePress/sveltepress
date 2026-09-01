import type { Plugin } from 'vite'
import type { LocalesConfig } from '../src/types'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import { resolveLocale, resolveLocaleSwitch, resolveLocalizedPath } from '../src/locale'
import { resolveLocalesConfig } from '../src/locale-scan'
import sveltepress from '../src/plugin'

const originalCwd = process.cwd()

afterEach(() => process.chdir(originalCwd))

function locales(): LocalesConfig {
  return {
    '/': {
      lang: 'en',
      label: 'English',
      theme: { navbar: ['en'] },
      routes: ['/', '/guide/', '/guide/install/', '/reference/new-api/'],
    },
    '/zh/': {
      lang: 'zh',
      label: '中文',
      theme: { navbar: ['zh'] },
      routes: ['/', '/guide/', '/guide/install/'],
    },
    '/bn/': {
      lang: 'bn',
      label: 'বাংলা',
      theme: { navbar: ['bn'] },
      routes: ['/'],
    },
  }
}

describe('locale resolution', () => {
  it('returns null when no locales are configured', () => {
    expect(resolveLocale('/guide/', null)).toBeNull()
    expect(resolveLocale('/guide/', undefined)).toBeNull()
    expect(resolveLocale('/guide/', {})).toBeNull()
  })

  it('matches the default locale for unprefixed paths', () => {
    expect(resolveLocale('/guide/', locales())).toMatchObject({ prefix: '/', lang: 'en', label: 'English' })
  })

  it('matches a prefixed locale and prefers the longest prefix', () => {
    expect(resolveLocale('/zh/guide/install/', locales())).toMatchObject({ prefix: '/zh/', lang: 'zh', label: '中文' })
    expect(resolveLocale('/bn/', locales())).toMatchObject({ prefix: '/bn/', lang: 'bn', label: 'বাংলা' })
  })

  it('ignores query strings and hash fragments', () => {
    expect(resolveLocale('/zh/guide/?from=home#intro', locales())?.prefix).toBe('/zh/')
  })

  it('matches a prefix without a trailing slash', () => {
    expect(resolveLocale('/zh', locales())?.prefix).toBe('/zh/')
  })

  it('does not treat a longer segment that merely shares the prefix as a match', () => {
    expect(resolveLocale('/zh-extra/guide/', locales())?.prefix).toBe('/')
  })

  it('returns null when the path matches no configured locale', () => {
    const only = { '/zh/': locales()['/zh/'] }
    expect(resolveLocale('/guide/', only)).toBeNull()
  })
})

describe('locale-aware link resolution', () => {
  const en = resolveLocale('/guide/', locales())!
  const zh = resolveLocale('/zh/guide/', locales())!

  it('rewrites bare internal links into the active locale', () => {
    expect(resolveLocalizedPath('/guide/install/', zh, locales())).toBe('/zh/guide/install/')
    expect(resolveLocalizedPath('/', zh, locales())).toBe('/zh/')
  })

  it('keeps links already inside the active locale unchanged', () => {
    expect(resolveLocalizedPath('/zh/guide/install/', zh, locales())).toBe('/zh/guide/install/')
    expect(resolveLocalizedPath('/zh/', zh, locales())).toBe('/zh/')
  })

  it('keeps cross-locale links unchanged', () => {
    expect(resolveLocalizedPath('/bn/guide/', zh, locales())).toBe('/bn/guide/')
  })

  it('keeps external, hash, and anchor links unchanged', () => {
    expect(resolveLocalizedPath('https://example.com', zh, locales())).toBe('https://example.com')
    expect(resolveLocalizedPath('#intro', zh, locales())).toBe('#intro')
    expect(resolveLocalizedPath('//cdn.example.com/app.js', zh, locales())).toBe('//cdn.example.com/app.js')
  })

  it('preserves query and hash suffixes byte-for-byte when localizing', () => {
    expect(resolveLocalizedPath('/guide/?tab=api', zh, locales())).toBe('/zh/guide/?tab=api')
    expect(resolveLocalizedPath('/guide/#install', zh, locales())).toBe('/zh/guide/#install')
    expect(resolveLocalizedPath('/guide/?tab=api#install', zh, locales())).toBe('/zh/guide/?tab=api#install')
  })

  it('does not add a synthetic trailing slash after the suffix', () => {
    expect(resolveLocalizedPath('/guide/?tab=api', zh, locales())).not.toMatch(/\?tab=api\//)
    expect(resolveLocalizedPath('/guide/#install', zh, locales())).not.toMatch(/#install\//)
  })

  it('leaves links untouched in the default locale', () => {
    expect(resolveLocalizedPath('/guide/install/', en, locales())).toBe('/guide/install/')
    expect(resolveLocalizedPath('/guide/?tab=api', en, locales())).toBe('/guide/?tab=api')
  })
})

describe('locale switch targets', () => {
  it('preserves the logical page when the target locale has that route', () => {
    expect(resolveLocaleSwitch('/guide/install/', '/zh/', locales())).toEqual({ href: '/zh/guide/install/', fallback: false })
  })

  it('falls back to the target locale home when the translation is missing', () => {
    expect(resolveLocaleSwitch('/reference/new-api/', '/zh/', locales())).toEqual({ href: '/zh/', fallback: true })
    expect(resolveLocaleSwitch('/guide/', '/bn/', locales())).toEqual({ href: '/bn/', fallback: true })
  })

  it('switches from a prefixed locale back to the default locale', () => {
    expect(resolveLocaleSwitch('/zh/guide/install/', '/', locales())).toEqual({ href: '/guide/install/', fallback: false })
    expect(resolveLocaleSwitch('/zh/', '/', locales())).toEqual({ href: '/', fallback: false })
  })

  it('recognizes concrete dynamic paths as translated routes', () => {
    const dynamic = {
      '/': { lang: 'en', label: 'English', theme: {}, routes: ['/', '/posts/[slug]/', '/guide/[[section]]/', '/docs/[...rest]/'] },
      '/zh/': { lang: 'zh', label: '中文', theme: {}, routes: ['/', '/posts/[slug]/', '/guide/[[section]]/', '/docs/[...rest]/'] },
    }
    expect(resolveLocaleSwitch('/posts/hello/', '/zh/', dynamic)).toEqual({ href: '/zh/posts/hello/', fallback: false })
    expect(resolveLocaleSwitch('/posts/hello/comments/', '/zh/', dynamic)).toEqual({ href: '/zh/', fallback: true })
    expect(resolveLocaleSwitch('/guide/', '/zh/', dynamic)).toEqual({ href: '/zh/guide/', fallback: false })
    expect(resolveLocaleSwitch('/docs/a/b/c/', '/zh/', dynamic)).toEqual({ href: '/zh/docs/a/b/c/', fallback: false })
    expect(resolveLocaleSwitch('/unrelated/route/', '/zh/', dynamic)).toEqual({ href: '/zh/', fallback: true })
  })

  it('returns null without locales or for an unknown target prefix', () => {
    expect(resolveLocaleSwitch('/guide/', '/zh/', null)).toBeNull()
    expect(resolveLocaleSwitch('/guide/', '/fr/', locales())).toBeNull()
  })
})

describe('locale route inventories', () => {
  it('scans per-locale routes and excludes other locales and version routes', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-locales-'))
    const mk = (dir: string) => mkdirSync(join(root, dir), { recursive: true })
    mk('src/routes/guide')
    mk('src/routes/zh/guide')
    mk('src/routes/zh/reference')
    mk('src/routes/bn')
    mk('src/routes/v/2026-08-28/guide')
    mk('src/routes/zh/v/2026-08-28/guide')
    writeFileSync(join(root, 'src/routes/+page.md'), '# Home')
    writeFileSync(join(root, 'src/routes/guide/+page.md'), '# Guide')
    writeFileSync(join(root, 'src/routes/zh/+page.md'), '# 首页')
    writeFileSync(join(root, 'src/routes/zh/guide/+page.md'), '# 指南')
    writeFileSync(join(root, 'src/routes/zh/reference/+page.md'), '# 参考')
    writeFileSync(join(root, 'src/routes/bn/+page.md'), '# হোম')
    writeFileSync(join(root, 'src/routes/v/2026-08-28/guide/+page.md'), '# Old')
    writeFileSync(join(root, 'src/routes/zh/v/2026-08-28/guide/+page.md'), '# 旧')

    const raw = {
      '/': { lang: 'en', label: 'English', theme: {} },
      '/zh/': { lang: 'zh', label: '中文', theme: {} },
      '/bn/': { lang: 'bn', label: 'বাংলা', theme: {} },
    }
    const resolved = resolveLocalesConfig(raw, root, '/v')
    expect(resolved['/'].routes).toEqual(['/', '/guide/'])
    expect(resolved['/zh/'].routes).toEqual(['/', '/guide/', '/reference/'])
    expect(resolved['/bn/'].routes).toEqual(['/'])
  })
})

describe('locale virtual module', () => {
  it('resolves and loads the locale module embedding config, routes, and helpers', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-locale-module-'))
    mkdirSync(join(root, 'src/routes/zh'), { recursive: true })
    writeFileSync(join(root, 'src/routes/zh/+page.md'), '# 首页')
    process.chdir(root)
    const plugin = sveltepress({ locales: locales() }) as Plugin
    const resolved = await (plugin.resolveId as (id: string) => unknown)('virtual:sveltepress/locale')
    expect(resolved).toBe('virtual:sveltepress/locale')
    const source = await (plugin.load as (id: string) => string)('virtual:sveltepress/locale')
    expect(source).toContain('export const locales')
    expect(source).toContain('"lang":"zh"')
    expect(source).toContain('"label":"中文"')
    expect(source).toContain('from \'@sveltepress/vite/locale\'')
    // scanned routes are embedded for the default locale (excluding zh/bn dirs)
    expect(source).toContain('"routes":["/"]')
  })

  it('exposes a null contract without the option and keeps behavior unchanged', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-locale-null-'))
    process.chdir(root)
    const plugin = sveltepress({}) as Plugin
    const source = await (plugin.load as (id: string) => string)('virtual:sveltepress/locale')
    expect(source).toContain('export const locales = null')
    expect(source).not.toContain('@sveltepress/vite/locale')
  })
})
