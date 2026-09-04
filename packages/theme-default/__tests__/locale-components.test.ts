// @vitest-environment happy-dom

import { cleanup, fireEvent, render, within } from '@testing-library/svelte'
import { tick } from 'svelte'
import { get } from 'svelte/store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ActionButton from '../src/components/ActionButton.svelte'
import GlobalLayout from '../src/components/GlobalLayout.svelte'
import Feature from '../src/components/home/Feature.svelte'
import { resolvedSidebar, resolveSidebar } from '../src/components/layout'
import Link from '../src/components/Link.svelte'
import LocaleFallbackNotice from '../src/components/LocaleFallbackNotice.svelte'
import LocaleSelector from '../src/components/LocaleSelector.svelte'
import Navbar from '../src/components/Navbar.svelte'
import NavbarMobile from '../src/components/NavbarMobile.svelte'
import PageSwitcher from '../src/components/PageSwitcher.svelte'
import VersionSelector from '../src/components/VersionSelector.svelte'
import { setPage } from './fixtures/app-state.svelte'
import { localeFixture, prefixedLocaleCases, setLocaleFixtures } from './fixtures/locale'
import { gotoCalls, resetNavigation } from './fixtures/navigation'

vi.mock('svelte/transition', () => ({
  slide: () => ({ duration: 0 }),
}))

beforeEach(() => {
  setPage('/guide/')
  window.history.replaceState({}, '', '/guide/')
  resetNavigation()
  setLocaleFixtures(localeFixture())
})

afterEach(() => {
  cleanup()
  setLocaleFixtures(null)
  document.documentElement.lang = ''
})

describe('language switcher', () => {
  it('renders the current locale label and switches while preserving the page', async () => {
    setPage('/guide/install/')
    const view = render(LocaleSelector)
    const trigger = view.getByRole('button', { name: 'Language' })
    expect(trigger.textContent).toContain('English')

    await fireEvent.click(trigger)
    await tick()
    const menu = view.getByRole('menu', { name: 'Language' })
    const zh = within(menu).getByRole('menuitem', { name: '中文' })
    await fireEvent.click(zh)
    expect(gotoCalls).toEqual(['/zh/guide/install/'])
  })

  it('switches to every configured locale while preserving the page', async () => {
    for (const { prefix, label } of prefixedLocaleCases()) {
      resetNavigation()
      setPage('/guide/install/')
      const view = render(LocaleSelector)
      await fireEvent.click(view.getByRole('button', { name: 'Language' }))
      await tick()
      await fireEvent.click(view.getByRole('menuitem', { name: label }))
      expect(gotoCalls).toEqual([`${prefix}guide/install/`])
      view.unmount()
    }
  })

  it('keeps the frozen version and heading hash when switching locales', async () => {
    setPage('/zh/v/2026-08-27/guide/#hot-reload')
    const view = render(LocaleSelector)
    await fireEvent.click(view.getByRole('button', { name: '切换语言' }))
    await tick()
    await fireEvent.click(view.getByRole('menuitem', { name: 'English' }))
    expect(gotoCalls).toEqual(['/v/2026-08-27/guide/#hot-reload'])
  })

  it('keeps the frozen version when switching to every configured locale', async () => {
    for (const { prefix, label } of prefixedLocaleCases()) {
      resetNavigation()
      setPage('/v/2026-08-27/guide/#hot-reload')
      const view = render(LocaleSelector)
      await fireEvent.click(view.getByRole('button', { name: 'Language' }))
      await tick()
      await fireEvent.click(view.getByRole('menuitem', { name: label }))
      expect(gotoCalls).toEqual([`${prefix}v/2026-08-27/guide/#hot-reload`])
      view.unmount()
    }
  })

  it('falls back to the target locale home when the translation is missing', async () => {
    setPage('/reference/new-api/')
    const view = render(LocaleSelector)
    await fireEvent.click(view.getByRole('button', { name: 'Language' }))
    await tick()
    await fireEvent.click(view.getByRole('menuitem', { name: '中文' }))
    expect(gotoCalls).toEqual(['/zh/?svp-locale-fallback=1'])
  })

  it('supports keyboard focus and arrow navigation', async () => {
    const view = render(LocaleSelector)
    const trigger = view.getByRole('button', { name: 'Language' })

    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await tick()
    const menu = view.getByRole('menu', { name: 'Language' })
    const items = view.getAllByRole('menuitem')
    expect(document.activeElement).toBe(items[0])

    await fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[1])
    await fireEvent.keyDown(menu, { key: 'Escape' })
    expect(document.activeElement).toBe(trigger)
  })

  it('renders the selector in the mobile navigation form', () => {
    const view = render(LocaleSelector, { mobile: true })
    expect(view.container.querySelector('.locale-selector.mobile')).not.toBeNull()
    expect(view.getByRole('button', { name: 'Language' })).toBeTruthy()
  })

  it('reads the switcher label from the active locale i18n strings', () => {
    setPage('/zh/guide/')
    const view = render(LocaleSelector)
    expect(view.getByRole('button', { name: '切换语言' }).textContent).toContain('中文')
  })

  it('renders nothing on a single-locale site', () => {
    setLocaleFixtures(null)
    const view = render(LocaleSelector)
    expect(view.container.querySelector('.locale-selector')).toBeNull()
    expect(view.queryByRole('button')).toBeNull()
  })
})

describe('locale-aware links', () => {
  it('resolves bare internal links within the active locale', () => {
    setPage('/zh/guide/')
    const view = render(Link, { props: { to: '/guide/install/', label: 'Install' } })
    expect(view.getByRole('link', { name: 'Install' }).getAttribute('href')).toBe('/zh/guide/install/')
  })

  it('keeps external and cross-locale links unchanged', () => {
    setPage('/zh/guide/')
    const external = render(Link, { props: { to: 'https://example.com', label: 'External' } })
    expect(external.getByRole('link', { name: 'External' }).getAttribute('href')).toBe('https://example.com')
    const cross = render(Link, { props: { to: '/bn/guide/', label: 'Bengali' } })
    expect(cross.getByRole('link', { name: 'Bengali' }).getAttribute('href')).toBe('/bn/guide/')
  })

  it('leaves links untouched in the default locale', () => {
    setPage('/guide/')
    const view = render(Link, { props: { to: '/guide/install/', label: 'Install' } })
    expect(view.getByRole('link', { name: 'Install' }).getAttribute('href')).toBe('/guide/install/')
  })

  it('keeps already versioned localized sidebar links on historical pages', () => {
    for (const { historicalGuide, historicalPrefix } of prefixedLocaleCases()) {
      setPage(historicalGuide)
      const view = render(Link, { props: { to: `${historicalPrefix}guide/install/`, label: 'Install' } })
      expect(view.getByRole('link', { name: 'Install' }).getAttribute('href')).toBe(
        `${historicalPrefix}guide/install/`,
      )
      view.unmount()
    }
  })

  it('keeps current-locale links on every historical locale when the frozen version lacks the route', () => {
    for (const { historicalGuide, currentI18n } of prefixedLocaleCases()) {
      setPage(historicalGuide)
      const view = render(Link, { props: { to: '/guide/i18n/', label: 'i18n' } })
      expect(view.getByRole('link', { name: 'i18n' }).getAttribute('href')).toBe(currentI18n)
      view.unmount()
    }
  })
})

describe('locale-aware home actions', () => {
  it('resolves home action buttons within the active locale', () => {
    setPage('/zh/')
    const view = render(ActionButton, {
      props: { to: '/guide/introduction/', label: '阅读文档', type: 'primary' },
    })
    expect(view.getByRole('link', { name: '阅读文档' }).getAttribute('href')).toBe(
      '/zh/guide/introduction/',
    )
  })

  it('resolves home action buttons within the Bengali locale', () => {
    setPage('/bn/')
    const view = render(ActionButton, {
      props: { to: '/guide/introduction/', label: 'ডক্‌স পড়ুন', type: 'primary' },
    })
    expect(view.getByRole('link', { name: 'ডক্‌স পড়ুন' }).getAttribute('href')).toBe(
      '/bn/guide/introduction/',
    )
  })

  it('keeps default-locale home action links unprefixed', () => {
    setPage('/')
    const view = render(ActionButton, {
      props: { to: '/guide/introduction/', label: 'Read the docs', type: 'primary' },
    })
    expect(view.getByRole('link', { name: 'Read the docs' }).getAttribute('href')).toBe(
      '/guide/introduction/',
    )
  })

  it('keeps external home action links unchanged', () => {
    setPage('/zh/')
    const view = render(ActionButton, {
      props: {
        to: 'https://github.com/SveltePress/sveltepress',
        label: 'GitHub',
        external: true,
      },
    })
    expect(view.getByRole('link', { name: 'GitHub' }).getAttribute('href')).toBe(
      'https://github.com/SveltePress/sveltepress',
    )
  })
})

describe('locale-aware home feature cards', () => {
  it('navigates feature cards within the active locale', async () => {
    setPage('/zh/')
    const view = render(Feature, {
      props: {
        i: 0,
        title: 'Markdown',
        description: 'Write docs',
        link: '/guide/markdown/frontmatter/',
      },
    })
    await fireEvent.click(view.getByRole('link'))
    expect(gotoCalls).toEqual(['/zh/guide/markdown/frontmatter/'])
  })

  it('keeps default-locale feature card links unprefixed', async () => {
    setPage('/')
    const view = render(Feature, {
      props: {
        i: 0,
        title: 'Markdown',
        description: 'Write docs',
        link: '/guide/markdown/frontmatter/',
      },
    })
    await fireEvent.click(view.getByRole('link'))
    expect(gotoCalls).toEqual(['/guide/markdown/frontmatter/'])
  })

  it('opens external feature card links without rewriting', async () => {
    setPage('/zh/')
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    try {
      const view = render(Feature, {
        props: {
          i: 0,
          title: 'GitHub',
          description: 'Repo',
          link: 'https://github.com/SveltePress/sveltepress',
        },
      })
      await fireEvent.click(view.getByRole('link'))
      expect(open).toHaveBeenCalledWith(
        'https://github.com/SveltePress/sveltepress',
        '_blank',
      )
      expect(gotoCalls).toEqual([])
    }
    finally {
      open.mockRestore()
    }
  })

  it('supports Enter key navigation on clickable feature cards', async () => {
    setPage('/zh/')
    const view = render(Feature, {
      props: {
        i: 0,
        title: 'i18n',
        description: 'Multi-language docs',
        link: '/guide/i18n/',
      },
    })
    const card = view.getByRole('link')
    await fireEvent.keyDown(card, { key: 'Enter' })
    expect(gotoCalls).toEqual(['/zh/guide/i18n/'])
  })

  it('renders non-clickable cards without link role when link is omitted', () => {
    const view = render(Feature, {
      props: {
        i: 0,
        title: 'Static Feature',
        description: 'Informational only',
      },
    })
    expect(view.queryByRole('link')).toBeNull()
    expect(view.container.querySelector('.feature-item')).not.toBeNull()
    expect(view.container.querySelector('.feature-item')?.classList.contains('clickable')).toBe(false)
  })
})

describe('locale-aware version selector', () => {
  it('switches historical versions within the active locale', async () => {
    setPage('/zh/guide/')
    const view = render(VersionSelector)
    const trigger = view.getByRole('button', { name: '文档版本' })
    await fireEvent.click(trigger)
    await tick()
    await fireEvent.click(view.getByRole('menuitem', { name: /2026-08-27/ }))
    expect(gotoCalls).toEqual(['/zh/v/2026-08-27/guide/'])
  })
})

describe('locale-aware navigation chrome', () => {
  it('renders the switcher and per-locale navbar in the desktop navbar', () => {
    setPage('/zh/guide/')
    const view = render(Navbar)
    expect(view.getByRole('button', { name: '切换语言' })).toBeTruthy()
    const link = view.getByRole('link', { name: '指南' })
    expect(link.getAttribute('href')).toBe('/zh/guide/')
  })

  it('renders the mobile switcher and per-locale navbar in the navigation drawer', async () => {
    setPage('/zh/guide/')
    const view = render(NavbarMobile)
    const trigger = view.getByRole('button', { name: '打开导航菜单' })
    await fireEvent.click(trigger)
    await tick()
    const navigation = view.getByRole('navigation', { name: 'Menu' })
    expect(within(navigation).getByRole('button', { name: '切换语言' })).toBeTruthy()
    const link = within(navigation).getByRole('link', { name: '指南' })
    expect(link.getAttribute('href')).toBe('/zh/guide/')
  })

  it('shows the locale fallback notice, cleans up URL parameter, and supports dismissal', async () => {
    setPage('/zh/')
    window.history.replaceState({}, '', '/zh/?svp-locale-fallback=1')
    const view = render(LocaleFallbackNotice)
    expect(view.getByRole('status').textContent).toContain('此页面没有中文版本，已返回中文首页。')
    expect(window.location.search).not.toContain('svp-locale-fallback')

    const closeBtn = view.getByRole('button', { name: 'Close' })
    await fireEvent.click(closeBtn)
    expect(view.queryByRole('status')).toBeNull()
  })

  it('shows no fallback notice without locales or a fallback marker', () => {
    const view = render(LocaleFallbackNotice)
    expect(view.queryByRole('status')).toBeNull()
  })
})

describe('locale-scoped page switcher', () => {
  it('resolves previous and next page links within every prefixed locale', () => {
    for (const { prefix, prevTitle, nextTitle } of prefixedLocaleCases()) {
      setPage(`${prefix}guide/new/`)
      resolveSidebar(`${prefix}guide/new/`)
      const view = render(PageSwitcher)
      const prev = view.getByRole('link', { name: new RegExp(prevTitle) })
      const next = view.getByRole('link', { name: new RegExp(nextTitle) })
      expect(prev.getAttribute('href')).toBe(`${prefix}guide/`)
      expect(next.getAttribute('href')).toBe(`${prefix}guide/unchanged/`)
      view.unmount()
    }
  })

  it('keeps default-locale page switcher links unprefixed', () => {
    setPage('/guide/new/')
    resolveSidebar('/guide/new/')
    const view = render(PageSwitcher)
    const prev = view.getByRole('link', { name: /Guide/ })
    const next = view.getByRole('link', { name: /Unchanged/ })
    expect(prev.getAttribute('href')).toBe('/guide/')
    expect(next.getAttribute('href')).toBe('/guide/unchanged/')
  })

  it('resolves previous and next page links within historical version routes', () => {
    setPage('/v/2026-08-27/guide/new/')
    resolveSidebar('/v/2026-08-27/guide/new/')
    const view = render(PageSwitcher)
    const prev = view.getByRole('link', { name: /Guide/ })
    const next = view.getByRole('link', { name: /Unchanged/ })
    expect(prev.getAttribute('href')).toBe('/v/2026-08-27/guide/')
    expect(next.getAttribute('href')).toBe('/guide/unchanged/')
  })

  it('keeps the sidebar on every localized historical version page', () => {
    for (const { historicalGuide, historicalPrefix, sidebarTitle } of prefixedLocaleCases()) {
      setPage(historicalGuide)
      resolveSidebar(historicalGuide)
      const items = get(resolvedSidebar)
      expect(items.length).toBeGreaterThan(0)
      expect(items[0]?.title).toBe(sidebarTitle)
      expect(items[0]?.items?.some(item => item.to?.startsWith(historicalPrefix))).toBe(true)
    }
  })
})

describe('document language', () => {
  it('emits the active locale language on the document element during SSR', () => {
    document.documentElement.lang = 'en'
    setPage('/guide/')
    render(GlobalLayout)
    expect(document.documentElement.lang).toBe('en')
  })

  it('updates the document language to every prefixed locale on the client', () => {
    for (const { prefix, lang } of prefixedLocaleCases()) {
      setPage(`${prefix}guide/`)
      const view = render(GlobalLayout)
      expect(document.documentElement.lang).toBe(lang)
      view.unmount()
    }
  })

  it('keeps the default language without locales', () => {
    setLocaleFixtures(null)
    setPage('/guide/')
    render(GlobalLayout)
    expect(document.documentElement.lang).toBe('')
  })
})
