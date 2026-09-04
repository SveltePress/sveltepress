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

  it('prefers the longest configured prefix when one locale prefix contains another', () => {
    const loc = {
      '/': { lang: 'en', label: 'English', theme: {} },
      '/zh/': { lang: 'zh', label: '中文', theme: {} },
      '/zh-tw/': { lang: 'zh-TW', label: '繁體中文', theme: {} },
    }
    expect(resolveLocale('/zh-tw/guide/', loc)?.prefix).toBe('/zh-tw/')
    expect(resolveLocale('/zh/guide/', loc)?.prefix).toBe('/zh/')
  })

  it('handles null, undefined, or empty pathnames safely without throwing', () => {
    expect(resolveLocale(null as any, locales())).toBeNull()
    expect(resolveLocale(undefined as any, locales())).toBeNull()
    expect(resolveLocale('', locales())).toBeNull()
  })

  it('supports base path prefix stripping during locale resolution', () => {
    expect(resolveLocale('/docs/zh/guide/', locales(), '/docs')).toMatchObject({ prefix: '/zh/', lang: 'zh' })
    expect(resolveLocale('/docs/guide/', locales(), '/docs')).toMatchObject({ prefix: '/', lang: 'en' })
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
  it('handles null, undefined, or empty pathnames safely in resolveLocaleSwitch', () => {
    expect(resolveLocaleSwitch(null as any, '/zh/', locales())).toBeNull()
    expect(resolveLocaleSwitch(undefined as any, '/zh/', locales())).toBeNull()
    expect(resolveLocaleSwitch('', '/zh/', locales())).toBeNull()
  })

  it('supports base path in resolveLocaleSwitch', () => {
    expect(resolveLocaleSwitch('/docs/guide/install/', '/zh/', locales(), '/docs')).toEqual({ href: '/zh/guide/install/', fallback: false })
  })

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

  it('preserves hash and query suffixes when switching locales', () => {
    expect(resolveLocaleSwitch('/zh/guide/install/#intro', '/', locales())).toEqual({
      href: '/guide/install/#intro',
      fallback: false,
    })
    expect(resolveLocaleSwitch('/guide/install/?tab=api#intro', '/zh/', locales())).toEqual({
      href: '/zh/guide/install/?tab=api#intro',
      fallback: false,
    })
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

  it('supports base path in resolveLocale, resolveLocalizedPath, and resolveLocaleSwitch', () => {
    const loc = locales()
    expect(resolveLocale('/docs/zh/guide/', loc, '/docs')?.prefix).toBe('/zh/')
    expect(resolveLocale('/docs/guide/', loc, '/docs')?.prefix).toBe('/')
    expect(resolveLocalizedPath('/docs/guide/', resolveLocale('/zh/', loc), loc, '/docs')).toBe('/zh/guide/')
    expect(resolveLocaleSwitch('/docs/zh/guide/', '/', loc, '/docs')).toEqual({ href: '/guide/', fallback: false })
  })

  it('keeps the same frozen version and hash when switching locales', () => {
    const loc = locales()
    const manifests = {
      '/': {
        basePath: '/v',
        current: { id: '2026-08-31', routes: ['/', '/guide/', '/guide/install/'] },
        versions: [
          { id: '2026-08-28', routes: ['/', '/guide/', '/guide/install/'] },
        ],
      },
      '/zh/': {
        basePath: '/zh/v',
        current: { id: '2026-08-31', routes: ['/', '/guide/', '/guide/install/'] },
        versions: [
          { id: '2026-08-28', routes: ['/', '/guide/', '/guide/install/'] },
        ],
      },
      '/bn/': {
        basePath: '/bn/v',
        current: { id: '2026-08-31', routes: ['/'] },
        versions: [
          { id: '2026-08-28', routes: ['/'] },
        ],
      },
    }
    expect(resolveLocaleSwitch('/zh/v/2026-08-28/guide/#intro', '/', loc, undefined, manifests)).toEqual({
      href: '/v/2026-08-28/guide/#intro',
      fallback: false,
    })
    expect(resolveLocaleSwitch('/v/2026-08-28/guide/install/', '/zh/', loc, undefined, manifests)).toEqual({
      href: '/zh/v/2026-08-28/guide/install/',
      fallback: false,
    })
    expect(resolveLocaleSwitch('/v/2026-08-28/guide/', '/bn/', loc, undefined, manifests)).toEqual({
      href: '/bn/',
      fallback: true,
    })
  })

  it('keeps the frozen version for every locale that publishes that snapshot', () => {
    const loc = locales()
    const manifests = {
      '/': {
        basePath: '/v',
        current: { id: '2026-08-31', routes: ['/', '/guide/'] },
        versions: [
          { id: '2026-08-28', routes: ['/', '/guide/'] },
        ],
      },
      '/zh/': {
        basePath: '/zh/v',
        current: { id: '2026-08-31', routes: ['/', '/guide/'] },
        versions: [
          { id: '2026-08-28', routes: ['/', '/guide/'] },
        ],
      },
      '/bn/': {
        basePath: '/bn/v',
        current: { id: '2026-08-31', routes: ['/', '/guide/'] },
        versions: [
          { id: '2026-08-28', routes: ['/', '/guide/'] },
        ],
      },
      '/ja/': {
        basePath: '/ja/v',
        current: { id: '2026-08-31', routes: ['/', '/guide/'] },
        versions: [
          { id: '2026-08-28', routes: ['/', '/guide/'] },
        ],
      },
    }
    const withJa = {
      ...loc,
      '/ja/': { lang: 'ja', label: '日本語', theme: {}, routes: ['/', '/guide/'] },
    }
    for (const prefix of ['/zh/', '/bn/', '/ja/'] as const) {
      expect(resolveLocaleSwitch('/v/2026-08-28/guide/', prefix, withJa, undefined, manifests)).toEqual({
        href: `${prefix}v/2026-08-28/guide/`,
        fallback: false,
      })
    }
    expect(resolveLocaleSwitch('/zh/v/2026-08-28/guide/', '/bn/', withJa, undefined, manifests)).toEqual({
      href: '/bn/v/2026-08-28/guide/',
      fallback: false,
    })
    expect(resolveLocaleSwitch('/zh/v/2026-08-28/guide/', '/ja/', withJa, undefined, manifests)).toEqual({
      href: '/ja/v/2026-08-28/guide/',
      fallback: false,
    })
  })

  it('falls back to the target current page when that frozen version is missing', () => {
    const loc = locales()
    const manifests = {
      '/': {
        basePath: '/v',
        current: { id: '2026-08-31', routes: ['/', '/guide/'] },
        versions: [
          { id: '2026-08-28', routes: ['/', '/guide/'] },
        ],
      },
      '/zh/': {
        basePath: '/zh/v',
        current: { id: '2026-08-31', routes: ['/', '/guide/'] },
        versions: [],
      },
    }
    expect(resolveLocaleSwitch('/v/2026-08-28/guide/', '/zh/', loc, undefined, manifests)).toEqual({
      href: '/zh/guide/',
      fallback: true,
    })
  })

  it('rewrites the locale prefix of a versioned path when manifests are absent', () => {
    const loc = locales()
    expect(resolveLocaleSwitch('/zh/v/2026-08-28/guide/#intro', '/', loc)).toEqual({
      href: '/v/2026-08-28/guide/#intro',
      fallback: false,
    })
    expect(resolveLocaleSwitch('/v/2026-08-28/guide/install/', '/zh/', loc)).toEqual({
      href: '/zh/v/2026-08-28/guide/install/',
      fallback: false,
    })
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

    const resolvedZhPrefixed = resolveLocalesConfig(raw, root, '/zh/v')
    expect(resolvedZhPrefixed['/zh/'].routes).toEqual(['/', '/guide/', '/reference/'])
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
