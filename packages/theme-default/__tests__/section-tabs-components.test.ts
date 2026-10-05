// @vitest-environment happy-dom

import type { SectionTab } from 'virtual:sveltepress/theme-default'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, render } from '@testing-library/svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Navbar from '../src/components/Navbar.svelte'
import PageLayout from '../src/components/PageLayout.svelte'
import Sidebar from '../src/components/Sidebar.svelte'
import { page, setPage } from './fixtures/app-state.svelte'
import { localeFixture, setLocaleFixtures } from './fixtures/locale'
import { resetNavigation } from './fixtures/navigation'
import themeOptions from './fixtures/theme-options'

const options = themeOptions as typeof themeOptions & { sectionTabs?: SectionTab[] }

const tabs: SectionTab[] = [
  { title: 'Guide', to: '/guide/', icon: 'tabler:book' },
  { title: 'API', to: '/reference/new-api/', icon: '<svg data-testid="api-icon"></svg>' },
  { title: 'GitHub', to: 'https://github.com/SveltePress/sveltepress' },
]

function source(file: string) {
  return readFileSync(resolve(import.meta.dirname, '../src/components', file), 'utf8')
}

function tabBar(container: HTMLElement) {
  return container.querySelector('.svp-section-tabs-bar')
}

function tabLink(container: Element | null, name: string) {
  return [...(container?.querySelectorAll('a.section-tab') ?? [])]
    .find(link => link.textContent?.trim() === name) as HTMLAnchorElement | undefined
}

beforeEach(() => {
  options.sectionTabs = tabs
  setPage('/guide/new/')
  page.error = null
  resetNavigation()
})

afterEach(() => {
  cleanup()
  delete options.sectionTabs
  setLocaleFixtures(null)
  page.error = null
})

describe('navbar section tabs', () => {
  it('renders the tabs row with the section of the current page marked', () => {
    const view = render(Navbar)
    const bar = tabBar(view.container)
    const nav = bar?.querySelector('nav')
    expect(nav?.getAttribute('aria-label')).toBe('Sections')

    const guide = tabLink(bar, 'Guide')
    expect(guide?.getAttribute('href')).toBe('/guide/')
    expect(guide?.getAttribute('aria-current')).toBe('true')
    expect(guide?.querySelector('.section-tab-icon')?.classList.contains('i-tabler-book')).toBe(true)

    const api = tabLink(bar, 'API')
    expect(api?.getAttribute('href')).toBe('/reference/new-api/')
    expect(api?.hasAttribute('aria-current')).toBe(false)
    expect(api?.querySelector('[data-testid="api-icon"]')).not.toBeNull()

    const github = tabLink(bar, 'GitHub')
    expect(github?.getAttribute('href')).toBe('https://github.com/SveltePress/sveltepress')
    expect(github?.getAttribute('target')).toBe('_blank')
  })

  it('moves the active tab with the route', () => {
    setPage('/reference/new-api/')
    const view = render(Navbar)
    expect(tabLink(tabBar(view.container), 'API')?.getAttribute('aria-current')).toBe('true')
    expect(tabLink(tabBar(view.container), 'Guide')?.hasAttribute('aria-current')).toBe(false)
  })

  it('stays out of the home page, error pages, and sites without tabs', () => {
    setPage('/')
    expect(tabBar(render(Navbar).container)).toBeNull()
    cleanup()

    setPage('/guide/new/')
    page.error = new Error('Not found')
    expect(tabBar(render(Navbar).container)).toBeNull()
    cleanup()

    page.error = null
    delete options.sectionTabs
    expect(tabBar(render(Navbar).container)).toBeNull()
  })

  it('localizes links, labels, and the landmark name per locale', () => {
    const fixture = localeFixture()
    fixture['/zh/']!.theme.sectionTabs = [{ title: '指南', to: '/guide/', icon: 'tabler:book' }]
    fixture['/zh/']!.theme.i18n = { ...fixture['/zh/']!.theme.i18n, sectionTabsLabel: '文档分区' }
    setLocaleFixtures(fixture)
    setPage('/zh/guide/new/')

    const bar = tabBar(render(Navbar).container)
    expect(bar?.querySelector('nav')?.getAttribute('aria-label')).toBe('文档分区')
    const guide = tabLink(bar, '指南')
    expect(guide?.getAttribute('href')).toBe('/zh/guide/')
    expect(guide?.getAttribute('aria-current')).toBe('true')
  })

  it('keeps links inside a historical version only where the version has the page', () => {
    setPage('/v/2026-08-27/guide/legacy-new/')
    const bar = tabBar(render(Navbar).container)
    const guide = tabLink(bar, 'Guide')
    expect(guide?.getAttribute('href')).toBe('/v/2026-08-27/guide/')
    expect(guide?.getAttribute('aria-current')).toBe('true')
    expect(tabLink(bar, 'API')?.getAttribute('href')).toBe('/reference/new-api/')
  })

  it('resolves historical links under the locale version base', () => {
    setLocaleFixtures(localeFixture())
    setPage('/zh/v/2026-08-27/guide/')
    const guide = tabLink(tabBar(render(Navbar).container), 'Guide')
    expect(guide?.getAttribute('href')).toBe('/zh/v/2026-08-27/guide/')
    expect(guide?.getAttribute('aria-current')).toBe('true')
  })
})

describe('sidebar drawer section tabs', () => {
  it('lists the tabs above the sidebar groups', () => {
    const view = render(Sidebar)
    const list = view.container.querySelector('.sidebar-section-tabs nav.section-tabs--list')
    expect(list).not.toBeNull()
    expect(tabLink(list, 'Guide')?.getAttribute('aria-current')).toBe('true')
    const groups = view.container.querySelector('.sidebar-group')
    expect(list!.compareDocumentPosition(groups!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders nothing extra without tabs', () => {
    delete options.sectionTabs
    expect(render(Sidebar).container.querySelector('.sidebar-section-tabs')).toBeNull()
  })
})

describe('page layout section tabs marker', () => {
  function marked(fm: Record<string, unknown>) {
    const view = render(PageLayout, { fm: { title: 'Guide', pageType: 'md', ...fm } })
    const result = view.container.querySelector('.theme-default--page-layout')?.classList.contains('svp-with-section-tabs')
    cleanup()
    return result
  }

  it('marks doc pages that show the sidebar and header', () => {
    expect(marked({})).toBe(true)
    expect(marked({ sidebar: false })).toBe(false)
    expect(marked({ header: false })).toBe(false)
    delete options.sectionTabs
    expect(marked({})).toBe(false)
  })
})

describe('section tabs layout contract', () => {
  it('reveals the row and its height only with both the page marker and the bar', () => {
    const navbar = source('Navbar.svelte')
    expect(navbar).toMatch(/\.svp-section-tabs-bar \{[^}]*hidden/)
    expect(navbar).toContain(':global(body:has(.svp-with-section-tabs):has(.svp-section-tabs-bar))')
    expect(navbar).toMatch(/--svp-section-tabs-height: 44px/)
    expect(navbar).toMatch(/\.header \{\s*height: calc\(73px \+ var\(--svp-section-tabs-height, 0px\)\)/)
  })

  it('offsets content, the table of contents, and anchors by the row height', () => {
    expect(source('GlobalLayout.svelte')).toMatch(/padding-top: calc\(73px \+ var\(--svp-section-tabs-height, 0px\)\)/)
    expect(source('GlobalLayout.svelte')).toMatch(/bottom: calc\(100px \+ var\(--svp-section-tabs-height, 0px\)\)/)
    expect(source('GlobalLayout.svelte')).toMatch(/section\.version-change-section\) \{\s*scroll-margin-top: calc\(6rem \+ var\(--svp-section-tabs-height, 0px\)\)/)
    expect(source('Toc.svelte')).toMatch(/top: calc\(80px \+ var\(--svp-section-tabs-height, 0px\)\)/)
    const banner = source('VersionLifecycleBanner.svelte')
    expect(banner.match(/var\(--svp-section-tabs-height, 0px\)/g)).toHaveLength(2)
  })
})
