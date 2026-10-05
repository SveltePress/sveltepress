import type { SectionTab } from 'virtual:sveltepress/theme-default'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  collectSectionTabIconClasses,
  isExternalSectionTabLink,
  resolveActiveSectionTab,
  resolveSectionTabIcon,
} from '../src/components/section-tabs'
import { getIconSafelist } from '../src/vite-plugins/icon-safelist'

const tabs: SectionTab[] = [
  { title: 'Get started', to: '/guide/introduction/', icon: 'tabler:rocket' },
  { title: 'Markdown', to: '/guide/markdown/basic-writing/', icon: 'tabler:markdown' },
  { title: 'Default theme', to: '/guide/default-theme/frontmatter/', icon: 'tabler:palette' },
  { title: 'Reference', to: '/reference/vite-plugin/', icon: 'tabler:code' },
]

const sidebar = {
  '/guide/': [],
  '/guide/markdown/': [],
  '/guide/default-theme/': [],
  '/reference/': [],
}

function activeTitle(path: string, sectionTabs: SectionTab[] = tabs, sidebarConfig: unknown = sidebar) {
  return sectionTabs[resolveActiveSectionTab(sectionTabs, path, sidebarConfig)]?.title ?? null
}

describe('active section tab', () => {
  it('follows the most specific sidebar key that holds each tab link', () => {
    expect(activeTitle('/guide/introduction/')).toBe('Get started')
    expect(activeTitle('/guide/quick-start/')).toBe('Get started')
    expect(activeTitle('/guide/markdown/frontmatter/')).toBe('Markdown')
    expect(activeTitle('/guide/default-theme/navbar/')).toBe('Default theme')
    expect(activeTitle('/reference/cli/')).toBe('Reference')
  })

  it('accepts route ids without a trailing slash', () => {
    expect(activeTitle('/guide/markdown/frontmatter')).toBe('Markdown')
    expect(activeTitle('/reference')).toBe('Reference')
  })

  it('leaves every tab inactive outside the sections', () => {
    expect(activeTitle('/whats-new/')).toBeNull()
    expect(activeTitle('/')).toBeNull()
    expect(activeTitle('/guide-extra/')).toBeNull()
    expect(activeTitle('')).toBeNull()
  })

  it('lets a tab own its own page and the pages below it when no sidebar key holds it', () => {
    const plain: SectionTab[] = [
      { title: 'Guide', to: '/guide/' },
      { title: 'API', to: '/api/' },
    ]
    expect(activeTitle('/api/components/', plain, {})).toBe('API')
    expect(activeTitle('/guide/', plain, undefined)).toBe('Guide')
    expect(activeTitle('/blog/', plain, {})).toBeNull()
  })

  it('ignores a site-wide `/` sidebar key when deriving sections', () => {
    const plain: SectionTab[] = [
      { title: 'Guide', to: '/guide/' },
      { title: 'API', to: '/api/' },
    ]
    expect(activeTitle('/api/components/', plain, { '/': [] })).toBe('API')
    expect(activeTitle('/guide/setup/', plain, { '/': [] })).toBe('Guide')
  })

  it('reads no sections from auto-sidebar options', () => {
    const plain: SectionTab[] = [{ title: 'Guide', to: '/guide/intro/' }]
    expect(activeTitle('/guide/setup/', plain, { enabled: true, roots: ['/guide/'] })).toBeNull()
    expect(activeTitle('/guide/intro/', plain, { enabled: true })).toBe('Guide')
  })

  it('prefers an explicit activeMatch over the derived section', () => {
    const explicit: SectionTab[] = [
      { title: 'Guide', to: '/guide/introduction/' },
      { title: 'Themes', to: '/guide/default-theme/frontmatter/', activeMatch: ['/guide/default-theme/', '/guide/blog-theme'] },
    ]
    const guideOnly = { '/guide/': [] }
    expect(activeTitle('/guide/blog-theme/features/', explicit, guideOnly)).toBe('Themes')
    expect(activeTitle('/guide/default-theme/navbar/', explicit, guideOnly)).toBe('Themes')
    expect(activeTitle('/guide/i18n/', explicit, guideOnly)).toBe('Guide')
    expect(activeTitle('/guide/i18n/', [{ title: 'Single', to: '/x/', activeMatch: '/guide' }], guideOnly)).toBe('Single')
  })

  it('gives a tie to the earlier tab', () => {
    const shared: SectionTab[] = [
      { title: 'First', to: '/guide/a/' },
      { title: 'Second', to: '/guide/b/' },
    ]
    expect(activeTitle('/guide/b/', shared, { '/guide/': [] })).toBe('First')
  })

  it('never activates external links or a tab that links home', () => {
    const links: SectionTab[] = [
      { title: 'Home', to: '/' },
      { title: 'GitHub', to: 'https://github.com/SveltePress/sveltepress' },
    ]
    expect(activeTitle('/guide/', links, {})).toBeNull()
    expect(activeTitle('/', links, {})).toBeNull()
    expect(isExternalSectionTabLink('https://example.com/')).toBe(true)
    expect(isExternalSectionTabLink('mailto:hi@example.com')).toBe(true)
    expect(isExternalSectionTabLink('//cdn.example.com/')).toBe(true)
    expect(isExternalSectionTabLink('/guide/')).toBe(false)
  })
})

describe('section tab icons', () => {
  it('maps Iconify names to UnoCSS classes and keeps anything else as HTML', () => {
    expect(resolveSectionTabIcon('tabler:rocket')).toEqual({ type: 'iconify', className: 'i-tabler-rocket' })
    expect(resolveSectionTabIcon('material-symbols:history')).toEqual({ type: 'iconify', className: 'i-material-symbols-history' })
    expect(resolveSectionTabIcon('<svg viewBox="0 0 24 24"></svg>')).toEqual({ type: 'html', html: '<svg viewBox="0 0 24 24"></svg>' })
    expect(resolveSectionTabIcon('🚀')).toEqual({ type: 'html', html: '🚀' })
    expect(resolveSectionTabIcon('  ')).toBeNull()
    expect(resolveSectionTabIcon(undefined)).toBeNull()
  })

  it('pre-builds every tab icon alongside preBuildIconifyIcons', () => {
    expect(collectSectionTabIconClasses([
      ...tabs,
      { title: 'Again', to: '/again/', icon: 'tabler:rocket' },
      { title: 'Inline', to: '/inline/', icon: '<svg></svg>' },
    ])).toEqual(['i-tabler-rocket', 'i-tabler-markdown', 'i-tabler-palette', 'i-tabler-code'])

    expect(getIconSafelist({
      preBuildIconifyIcons: { tabler: ['icons', 'rocket'] },
      sectionTabs: tabs,
    })).toEqual(['i-tabler-icons', 'i-tabler-rocket', 'i-tabler-markdown', 'i-tabler-palette', 'i-tabler-code'])
    expect(getIconSafelist({ sectionTabs: tabs.slice(0, 1) })).toEqual(['i-tabler-rocket'])
    expect(getIconSafelist()).toEqual([])
  })

  it('keeps every icon when compiled the way svelte-package publishes it', async () => {
    const ts: typeof import('typescript') = createRequire(import.meta.url)('typescript')
    const packageRoot = resolve(import.meta.dirname, '..')
    const configFile = join(packageRoot, 'tsconfig.json')
    const { config } = ts.readConfigFile(configFile, ts.sys.readFile)
    const { options } = ts.parseJsonConfigFileContent(config, ts.sys, dirname(configFile))
    const source = readFileSync(join(packageRoot, 'src/components/section-tabs.ts'), 'utf8')
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { ...options, module: ts.ModuleKind.ESNext },
    })
    const directory = mkdtempSync(join(tmpdir(), 'svp-section-tabs-'))
    try {
      const file = join(directory, 'section-tabs.mjs')
      writeFileSync(file, outputText)
      const compiled = await import(/* @vite-ignore */ pathToFileURL(file).href)
      expect(compiled.collectSectionTabIconClasses(tabs)).toEqual(collectSectionTabIconClasses(tabs))
    }
    finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
