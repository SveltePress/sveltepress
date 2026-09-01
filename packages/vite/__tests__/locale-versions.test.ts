import type { Plugin } from 'vite'
import type { VersionManifest } from '../src/versioning'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import { generateLlmsTxtForLocales } from '../src/llms'
import sveltepress from '../src/plugin'
import { localeVersionManifestName, validateVersionManifest } from '../src/versioning'
import { createLocaleVersionRuntime } from '../src/versioning/runtime'

const originalCwd = process.cwd()

afterEach(() => process.chdir(originalCwd))

function enManifest(): VersionManifest {
  return {
    basePath: '/v',
    current: { id: 'v9', label: '9.x', routes: ['/', '/guide/'] },
    versions: [
      { id: 'v8', label: '8.x', status: 'stable', routes: ['/', '/guide/'] },
    ],
    content: { include: ['**'], exclude: [], shared: [] },
  }
}

function zhManifest(): VersionManifest {
  return {
    basePath: '/zh/v',
    current: { id: '2026-08-28', label: '2026-08-28', routes: ['/', '/guide/'] },
    versions: [
      { id: '2026-08-27', label: '2026-08-27', status: 'stable', routes: ['/', '/guide/'] },
    ],
    content: { include: ['**'], exclude: [], shared: [] },
  }
}

describe('locale-scoped version manifests', () => {
  it('accepts a multi-segment base path composed with the locale prefix', () => {
    expect(() => validateVersionManifest(zhManifest())).not.toThrow()
    expect(() => validateVersionManifest(enManifest())).not.toThrow()
    const unsafe = zhManifest() as VersionManifest & { basePath: string }
    unsafe.basePath = '/zh//v'
    expect(() => validateVersionManifest(unsafe)).toThrow(/basePath/)
    unsafe.basePath = '/Zh/v'
    expect(() => validateVersionManifest(unsafe)).toThrow(/basePath/)
  })

  it('derives the locale-scoped manifest file from the locale prefix', () => {
    expect(localeVersionManifestName('/')).toBe('sveltepress.versions.json')
    expect(localeVersionManifestName('/zh/')).toBe('sveltepress.versions.zh.json')
    expect(localeVersionManifestName('/bn/')).toBe('sveltepress.versions.bn.json')
    expect(localeVersionManifestName('/zh/', 'custom.versions.json')).toBe('custom.versions.zh.json')
  })
})

describe('locale-aware version runtime', () => {
  const manifests = {
    '/': enManifest(),
    '/zh/': zhManifest(),
    '/bn/': null,
  }
  const runtime = createLocaleVersionRuntime(manifests, (pathname) => {
    if (pathname.startsWith('/zh/') || pathname === '/zh')
      return '/zh/'
    return '/'
  })

  it('resolves the manifest by the current route locale', () => {
    expect(runtime.resolveVersionManifest('/zh/guide/')?.basePath).toBe('/zh/v')
    expect(runtime.resolveVersionManifest('/guide/')?.basePath).toBe('/v')
    expect(runtime.resolveVersionContext('/zh/guide/')?.versionId).toBe('2026-08-28')
    expect(runtime.resolveVersionContext('/guide/')?.versionId).toBe('v9')
    expect(runtime.resolveVersionContext('/zh/v/2026-08-27/guide/')).toMatchObject({
      versionId: '2026-08-27',
      logicalPath: '/guide/',
      historical: true,
    })
  })

  it('composes versioned paths with the locale prefix', () => {
    const context = runtime.resolveVersionContext('/zh/v/2026-08-27/guide/')!
    expect(runtime.resolveVersionedPath('/guide/', context)).toBe('/zh/v/2026-08-27/guide/')
    const enContext = runtime.resolveVersionContext('/v/v8/guide/')!
    expect(runtime.resolveVersionedPath('/guide/', enContext)).toBe('/v/v8/guide/')
  })

  it('switches versions within the active locale', () => {
    expect(runtime.resolveVersionSwitch('/zh/guide/', '2026-08-27')).toEqual({ href: '/zh/v/2026-08-27/guide/', fallback: false })
    expect(runtime.resolveVersionSwitch('/guide/', 'v8')).toEqual({ href: '/v/v8/guide/', fallback: false })
  })

  it('exposes changes per manifest and a default current change lookup', () => {
    expect(runtime.resolveVersionChanges('2026-08-27')).toBeNull()
    expect(runtime.resolveVersionChanges('v8')).toBeNull()
    expect(runtime.changeSets).toEqual({})
  })
})

describe('versions virtual module with locales', () => {
  it('embeds per-locale manifests and a locale-aware runtime contract', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-locale-versions-'))
    mkdirSync(join(root, 'src/routes/zh'), { recursive: true })
    writeFileSync(join(root, 'src/routes/zh/+page.md'), '# 首页')
    writeFileSync(join(root, 'sveltepress.versions.json'), JSON.stringify(enManifest()))
    writeFileSync(join(root, 'sveltepress.versions.zh.json'), JSON.stringify(zhManifest()))
    process.chdir(root)
    const locales = {
      '/': { lang: 'en', label: 'English', theme: {} },
      '/zh/': { lang: 'zh', label: '中文', theme: {} },
    }
    const plugin = sveltepress({ locales }) as Plugin
    const source = await (plugin.load as (id: string) => string)('virtual:sveltepress/versions')
    expect(source).toContain('createLocaleVersionRuntime')
    expect(source).toContain('"basePath":"/zh/v"')
    expect(source).toContain('resolveVersionManifest')
  })

  it('keeps the single-manifest contract when locales are absent', async () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-single-versions-'))
    writeFileSync(join(root, 'sveltepress.versions.json'), JSON.stringify(enManifest()))
    process.chdir(root)
    const plugin = sveltepress({}) as Plugin
    const source = await (plugin.load as (id: string) => string)('virtual:sveltepress/versions')
    expect(source).toContain('createVersionRuntime')
    expect(source).not.toContain('createLocaleVersionRuntime')
  })
})

describe('per-locale llms with version history', () => {
  it('writes historical llms under each locale root from that locale manifest', () => {
    const root = mkdtempSync(join(tmpdir(), 'sveltepress-locale-llms-versions-'))
    mkdirSync(join(root, 'src/routes/guide'), { recursive: true })
    mkdirSync(join(root, 'src/routes/zh/guide'), { recursive: true })
    mkdirSync(join(root, 'src/routes/v/v8/guide'), { recursive: true })
    mkdirSync(join(root, 'src/routes/zh/v/2026-08-27/guide'), { recursive: true })
    writeFileSync(join(root, 'src/routes/guide/+page.md'), '---\ntitle: Guide\n---\nEnglish guide')
    writeFileSync(join(root, 'src/routes/zh/guide/+page.md'), '---\ntitle: 指南\n---\n中文指南')
    writeFileSync(join(root, 'src/routes/v/v8/guide/+page.md'), '---\ntitle: Old guide\n---\nOld guide body')
    writeFileSync(join(root, 'src/routes/zh/v/2026-08-27/guide/+page.md'), '---\ntitle: 旧指南\n---\n旧指南正文')
    const locales = {
      '/': { lang: 'en', label: 'English', theme: {} },
      '/zh/': { lang: 'zh', label: '中文', theme: {} },
    }
    const manifests = { '/': enManifest(), '/zh/': zhManifest() }
    generateLlmsTxtForLocales(
      { enabled: true, baseUrl: 'https://docs.example.com' },
      { title: 'Docs' },
      locales,
      manifests,
      root,
    )
    const enHistorical = readFileSync(join(root, 'static/v/v8/llms.txt'), 'utf8')
    expect(enHistorical).toContain('[Old guide](https://docs.example.com/v/v8/guide)')
    const zhHistorical = readFileSync(join(root, 'static/zh/v/2026-08-27/llms.txt'), 'utf8')
    expect(zhHistorical).toContain('[旧指南](https://docs.example.com/zh/v/2026-08-27/guide)')
    const zhCurrent = readFileSync(join(root, 'static/zh/llms.txt'), 'utf8')
    expect(zhCurrent).not.toContain('旧指南')
    const enCurrent = readFileSync(join(root, 'static/llms.txt'), 'utf8')
    expect(enCurrent).not.toContain('Old guide body')
  })
})
