// @vitest-environment happy-dom

import { mdToSvelte } from '@sveltepress/vite'
import { cleanup, fireEvent, render, within } from '@testing-library/svelte'
import { tick } from 'svelte'
import { compile } from 'svelte/compiler'
import { get } from 'svelte/store'
import themeOptions from 'virtual:sveltepress/theme-default'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GlobalLayout from '../src/components/GlobalLayout.svelte'
import { anchors, navCollapsed, resolveSidebar, sidebar } from '../src/components/layout'
import MobileSubNav from '../src/components/MobileSubNav.svelte'
import Navbar from '../src/components/Navbar.svelte'
import NavbarMobile from '../src/components/NavbarMobile.svelte'
import PageLayout from '../src/components/PageLayout.svelte'
import Sidebar from '../src/components/Sidebar.svelte'
import Toc from '../src/components/Toc.svelte'
import VersionChanges from '../src/components/VersionChanges.svelte'
import VersionFallbackNotice from '../src/components/VersionFallbackNotice.svelte'
import VersionLifecycleBanner from '../src/components/VersionLifecycleBanner.svelte'
import VersionSelector from '../src/components/VersionSelector.svelte'
import versionSelectorSource from '../src/components/VersionSelector.svelte?raw'
import anchorHeadings from '../src/markdown/anchors'
import versionChanges from '../src/markdown/version-changes'
import { setPage } from './fixtures/app-state.svelte'
import { gotoCalls, resetNavigation } from './fixtures/navigation'
import { manifest as versionManifest } from './fixtures/versions'

vi.mock('svelte/transition', () => ({
  slide: () => ({ duration: 0 }),
}))

beforeEach(() => {
  setPage('/guide/')
  window.history.replaceState({}, '', '/guide/')
  resetNavigation()
  anchors.set([])
  navCollapsed.set(true)
  sidebar.set(true)
})

afterEach(cleanup)

describe('rendered documentation version UI', () => {
  it('renders a localized desktop selector and supports keyboard focus and fallback selection', async () => {
    const view = render(VersionSelector)
    const trigger = view.getByRole('button', { name: '文档版本' })
    expect(trigger.textContent).toContain('2026-08-28')

    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await tick()
    const menu = view.getByRole('menu', { name: '文档版本' })
    const items = view.getAllByRole('menuitem')
    expect(document.activeElement).toBe(items[0])

    await fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[1])
    await fireEvent.click(items[1])
    expect(gotoCalls).toEqual(['/v/2026-08-27/guide/'])
  })

  it('renders the selector in the mobile navigation form', () => {
    const view = render(VersionSelector, { mobile: true })
    expect(view.container.querySelector('.version-selector.mobile')).not.toBeNull()
    expect(view.getByRole('button', { name: '文档版本' })).toBeTruthy()
  })

  it('keeps the compact navigation selector visible above the mobile breakpoint', () => {
    const style = document.createElement('style')
    const componentCss = compile(versionSelectorSource, {
      filename: new URL(
        '../src/components/VersionSelector.svelte',
        import.meta.url,
      ).pathname,
    }).css?.code ?? ''
    style.textContent = componentCss.replaceAll(/\.svelte-[\w-]+/g, '')
    document.head.append(style)

    try {
      const view = render(VersionSelector, { mobile: true })
      const selector = view.container.querySelector<HTMLElement>(
        '.version-selector.mobile',
      )

      expect(selector).not.toBeNull()
      expect(getComputedStyle(selector!).display).toBe('flex')
    }
    finally {
      style.remove()
    }
  })

  it('exposes the compact navigation as a labelled disclosure button', async () => {
    const view = render(NavbarMobile)
    const trigger = view.getByRole('button', { name: '打开导航菜单' })

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('aria-controls')).toBe(
      'sveltepress-mobile-navigation',
    )

    await fireEvent.click(trigger)

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const navigation = view.getByRole('navigation', { name: 'Menu' })
    expect(navigation.id).toBe('sveltepress-mobile-navigation')
    expect(navigation.classList.contains('has-sidebar')).toBe(true)
    expect(
      within(navigation).getByRole('button', { name: '文档版本' }),
    ).toBeTruthy()
  })

  it('keeps date version labels intact and renders lifecycle states as badges', async () => {
    const view = render(VersionSelector)
    await fireEvent.click(view.getByRole('button', { name: '文档版本' }))

    const deprecated = view.getByRole('menuitem', { name: /2026-08-27 已弃用/ })
    const versionLabel = within(deprecated).getByText('2026-08-27')
    const statusBadge = within(deprecated).getByText('已弃用')

    expect(getComputedStyle(versionLabel).whiteSpace).toBe('nowrap')
    expect(statusBadge.classList.contains('version-status-badge')).toBe(true)
  })

  it('renders localized lifecycle and missing-page notices', () => {
    setPage('/v/2026-08-27/guide/')
    const lifecycle = render(VersionLifecycleBanner)
    expect(lifecycle.getByRole('status', { name: '已弃用' }).textContent).toContain(
      '当前访问的是旧版站点，无法保证所有功能可用性，请切换至',
    )
    expect(lifecycle.getByRole('link', { name: '新版本' }).getAttribute('href')).toBe('/guide/')

    cleanup()
    window.history.replaceState({}, '', '/v/2026-08-27/?svp-version-fallback=1')
    const fallback = render(VersionFallbackNotice)
    expect(fallback.getByRole('status').textContent).toBe('所选版本没有此页面，已返回版本首页。')
  })

  it('renders a concise default current-version action', () => {
    const configuredLabel = themeOptions.i18n.versionViewCurrent
    Reflect.deleteProperty(themeOptions.i18n, 'versionViewCurrent')

    try {
      setPage('/v/2026-08-27/guide/')
      const view = render(VersionLifecycleBanner)
      const link = view.getByRole('link', { name: 'Current version' })

      expect(link.textContent?.trim()).toBe('Current version')
    }
    finally {
      themeOptions.i18n.versionViewCurrent = configuredLabel
    }
  })

  it('renders the old-version warning as a global bar before the page shell', () => {
    setPage('/v/2026-08-27/guide/')

    const view = render(GlobalLayout)
    const banner = view.getByRole('status', { name: '已弃用' })
    const main = view.container.querySelector('main')

    expect(view.container.firstElementChild).toBe(banner)
    expect(
      banner.compareDocumentPosition(main!),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(banner.textContent).toContain(
      '当前访问的是旧版站点，无法保证所有功能可用性，请切换至',
    )
    expect(view.getByRole('link', { name: '新版本' }).getAttribute('href')).toBe(
      '/guide/',
    )
  })

  it('disables historical search and restores current search after SPA navigation', async () => {
    const view = render(Navbar)
    expect(view.getByTestId('search').textContent).toBe('search:2026-08-28')

    setPage('/v/2026-08-27/guide/')
    await tick()
    expect(view.getByRole('status').textContent).toBe('此文档版本不提供搜索。')
    expect(view.queryByTestId('search')).toBeNull()

    setPage('/guide/')
    await tick()
    expect(view.getByTestId('search').textContent).toBe('search:2026-08-28')
  })

  it('shows the page badge only while browsing the version that introduced it', async () => {
    setPage('/guide/new/')
    const current = render(PageLayout, { fm: { title: 'New guide', pageType: 'md' } })
    expect(current.getByText('新增于 2026-08-28')).toBeTruthy()

    cleanup()
    setPage('/v/2026-08-27/guide/')
    const historical = render(PageLayout, { fm: { title: 'Guide', pageType: 'md' } })
    expect(historical.queryByText('新增于 2026-08-28')).toBeNull()
  })

  it('marks new and updated pages in the sidebar for the active version', () => {
    setPage('/guide/')
    resolveSidebar('/guide/')

    const view = render(Sidebar)

    expect(view.getByRole('link', { name: 'Guide, 新' })).toBeTruthy()
    expect(view.getByRole('link', { name: 'New guide, 新' })).toBeTruthy()
    expect(view.getByRole('link', { name: 'Unchanged' })).toBeTruthy()
    expect(view.container.querySelectorAll('.version-navigation-new-badge')).toHaveLength(2)
  })

  it('marks only explicitly changed sections in the current page table of contents', () => {
    setPage('/guide/')
    resolveSidebar('/guide/')

    const view = render(Toc, {
      anchors: [
        {
          slugId: 'hot-reload-options',
          title: 'Hot reload',
          depth: 2,
          versionChangeId: 'hot-reload',
        },
        { slugId: 'existing-section', title: 'Existing section', depth: 2 },
      ],
    })

    expect(view.getByRole('link', { name: 'Hot reload 新' }).getAttribute('href')).toBe('#hot-reload-options')
    expect(view.getByRole('link', { name: 'Existing section' })).toBeTruthy()
    expect(view.container.querySelectorAll('.version-navigation-new-badge')).toHaveLength(1)
  })

  it('automatically marks the preceding table-of-contents heading for a version change', async () => {
    const compiled = await mdToSvelte({
      filename: '/site/src/routes/guide/+page.md',
      mdContent: `## Focus

Use focus commands in code blocks.

:::since[Multiple focus ranges]{version="2026-08-28" id="hot-reload"}
Multiple focus commands can appear in one code block.
:::

:::since[Earlier focus update]{version="2026-08-27" id="earlier-focus-update"}
An earlier version also changed this section.
:::

## Existing section

Existing content.`,
      remarkPlugins: [versionChanges({ manifest: versionManifest }), anchorHeadings],
    })
    expect(compiled.data.anchors).toEqual([
      {
        slugId: 'Focus',
        title: 'Focus',
        depth: 2,
        versionChangeIds: ['hot-reload', 'earlier-focus-update'],
      },
      {
        slugId: 'Existing-section',
        title: 'Existing section',
        depth: 2,
      },
    ])
    setPage('/guide/')
    resolveSidebar('/guide/')

    const view = render(Toc, { anchors: compiled.data.anchors })

    expect(view.getByRole('link', { name: 'Focus 新' }).getAttribute('href')).toBe('#Focus')
    expect(view.getByRole('link', { name: 'Existing section' })).toBeTruthy()
    expect(view.container.querySelectorAll('.version-navigation-new-badge')).toHaveLength(1)
  })

  it('renders an arbitrary home page as a standalone landing page', () => {
    setPage('/whats-new/')
    const view = render(PageLayout, {
      fm: {
        title: 'What\'s new',
        description: 'Explore the latest documentation changes.',
        home: true,
        heroImage: false,
        pageType: 'md',
      },
    })

    expect(view.container.querySelector('.home-page')).not.toBeNull()
    expect(view.getByRole('heading', { name: 'What\'s new' })).toBeTruthy()
    expect(view.container.querySelector('.theme-default--page-layout')).toBeNull()
    expect(view.container.querySelector('.meta')).toBeNull()
  })

  it('keeps the default root home page free of docs navigation spacing', () => {
    setPage('/')
    anchors.set([{ id: 'stale-anchor', title: 'Stale anchor' }])
    render(PageLayout, {
      fm: {
        title: 'SveltePress',
        description: 'Build documentation sites.',
        pageType: 'md',
      },
    })

    expect(get(sidebar)).toBe(false)
    expect(get(anchors)).toEqual([])
  })

  it('localizes the default hero code visual through theme options', () => {
    setPage('/')
    const view = render(PageLayout, {
      fm: {
        title: 'SveltePress',
        description: '构建文档站点。',
        pageType: 'md',
      },
    })

    const hero = view.container.querySelector('.hero-code')
    const source = hero?.querySelector('.code')

    expect(hero).not.toBeNull()
    expect(hero?.querySelectorAll('.c-str')).toHaveLength(1)
    expect(hero?.querySelector('.c-str')?.textContent).toBe('你好')
    expect(source?.textContent).toContain('在 **Markdown** 中使用 Svelte')
    expect(hero?.querySelector('.r-title')?.textContent).toBe('你好')
    expect(hero?.querySelector('.r-tip-label')?.textContent).toBe('提示')
    expect(hero?.querySelector('.r-btn')?.textContent).toBe('计数：1')
  })

  it('keeps English defaults for partially localized hero code content', () => {
    const configuredHeroCode = { ...themeOptions.i18n.heroCode }
    themeOptions.i18n.heroCode.title = 'Bonjour'
    for (const key of [
      'messageBefore',
      'messageStrong',
      'messageAfter',
      'tipLabel',
      'counterLabel',
    ])
      Reflect.deleteProperty(themeOptions.i18n.heroCode, key)

    try {
      setPage('/')
      const view = render(PageLayout, {
        fm: {
          title: 'SveltePress',
          description: 'Build documentation sites.',
          pageType: 'md',
        },
      })
      const hero = view.container.querySelector('.hero-code')

      expect(hero?.querySelector('.c-str')?.textContent).toBe('Bonjour')
      expect(hero?.querySelector('.code')?.textContent).toContain(
        'Svelte in **markdown**',
      )
      expect(hero?.querySelector('.r-tip-label')?.textContent).toBe('TIP')
      expect(hero?.querySelector('.r-btn')?.textContent).toBe('Count: 1')
    }
    finally {
      Object.assign(themeOptions.i18n.heroCode, configuredHeroCode)
    }
  })

  it('renders a historical root snapshot with the home page layout', () => {
    setPage('/v/2026-08-27/')

    const view = render(PageLayout, {
      fm: {
        title: 'SveltePress',
        description: 'Build documentation sites.',
        pageType: 'md',
      },
    })

    expect(view.container.querySelector('.home-page')).not.toBeNull()
    expect(view.container.querySelector('.theme-default--page-layout')).toBeNull()
    expect(view.container.querySelector('.meta')).toBeNull()
    expect(get(sidebar)).toBe(false)
    expect(get(anchors)).toEqual([])
  })

  it('omits the mobile docs subnav when a landing page has no docs controls', () => {
    sidebar.set(false)
    anchors.set([])
    const view = render(MobileSubNav)

    expect(view.queryByRole('navigation', { name: 'Browse docs' })).toBeNull()
  })

  it('renders both change groups with exact current links', () => {
    setPage('/whats-new/')
    const view = render(VersionChanges)
    expect(view.getByRole('combobox', { name: '查看版本变化' })).toBeTruthy()
    const summary = view.getByRole('region', { name: '2026-08-28' })
    expect(summary).toBeTruthy()
    expect(view.getByRole('heading', { name: '新增页面 1' })).toBeTruthy()
    expect(view.getByRole('link', { name: 'New guide' }).getAttribute('href')).toBe('/guide/new/')
    expect(view.getByRole('heading', { name: '更新页面 1' })).toBeTruthy()
    expect(view.getByRole('link', { name: 'Hot reload' }).getAttribute('href')).toBe('/guide/#hot-reload')
    expect(view.container.querySelectorAll('.change-card')).toHaveLength(2)
    for (const label of view.container.querySelectorAll('.release-stat span'))
      expect(getComputedStyle(label).whiteSpace).not.toBe('nowrap')
  })

  it('defaults a historical overview route to that version\'s frozen changes', () => {
    setPage('/v/2026-08-27/whats-new/')
    const view = render(VersionChanges)

    expect(view.getByRole('region', { name: '2026-08-27' })).toBeTruthy()
    expect(view.queryByRole('region', { name: '2026-08-28' })).toBeNull()
    expect(
      view.getByRole('link', { name: 'Legacy new page' }).getAttribute('href'),
    ).toBe('/v/2026-08-27/guide/legacy-new/')
  })

  it('lets a valid query override the route version and ignores invalid queries', () => {
    setPage('/v/2026-08-27/whats-new/?version=2026-08-28')
    let view = render(VersionChanges)
    expect(view.getByRole('region', { name: '2026-08-28' })).toBeTruthy()

    cleanup()
    setPage('/v/2026-08-27/whats-new/?version=unknown')
    view = render(VersionChanges)
    expect(view.getByRole('region', { name: '2026-08-27' })).toBeTruthy()
  })

  it('switches the overview through URL state and uses historical links', async () => {
    setPage('/whats-new/?version=2026-08-26')
    let view = render(VersionChanges)
    expect(view.getByRole('status').textContent).toContain('首个版本')
    expect(view.getByRole('heading', { name: '新增页面 0' })).toBeTruthy()
    expect(view.getByRole('heading', { name: '更新页面 0' })).toBeTruthy()

    cleanup()
    setPage('/whats-new/?version=2026-08-27')
    view = render(VersionChanges)
    expect(view.getByRole('link', { name: 'Legacy new page' }).getAttribute('href')).toBe('/v/2026-08-27/guide/legacy-new/')

    cleanup()
    setPage('/whats-new/')
    view = render(VersionChanges)
    await fireEvent.change(view.getByRole('combobox'), { target: { value: '2026-08-27' } })
    expect(gotoCalls).toEqual(['/whats-new/?version=2026-08-27'])
  })
})
