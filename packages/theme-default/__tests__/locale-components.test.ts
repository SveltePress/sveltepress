// @vitest-environment happy-dom

import { cleanup, fireEvent, render, within } from '@testing-library/svelte'
import { tick } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GlobalLayout from '../src/components/GlobalLayout.svelte'
import { resolveSidebar } from '../src/components/layout'
import Link from '../src/components/Link.svelte'
import LocaleFallbackNotice from '../src/components/LocaleFallbackNotice.svelte'
import LocaleSelector from '../src/components/LocaleSelector.svelte'
import Navbar from '../src/components/Navbar.svelte'
import NavbarMobile from '../src/components/NavbarMobile.svelte'
import PageSwitcher from '../src/components/PageSwitcher.svelte'
import { setPage } from './fixtures/app-state.svelte'
import { localeFixture, setLocaleFixtures } from './fixtures/locale'
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
  it('resolves previous and next page links within the active locale', () => {
    setPage('/zh/guide/new/')
    resolveSidebar('/zh/guide/new/')
    const view = render(PageSwitcher)
    const prev = view.getByRole('link', { name: /Guide/ })
    const next = view.getByRole('link', { name: /Unchanged/ })
    expect(prev.getAttribute('href')).toBe('/zh/guide/')
    expect(next.getAttribute('href')).toBe('/zh/guide/unchanged/')
  })

  it('resolves previous and next page links within the Bengali locale', () => {
    setPage('/bn/guide/new/')
    resolveSidebar('/bn/guide/new/')
    const view = render(PageSwitcher)
    const prev = view.getByRole('link', { name: /Guide/ })
    const next = view.getByRole('link', { name: /Unchanged/ })
    expect(prev.getAttribute('href')).toBe('/bn/guide/')
    expect(next.getAttribute('href')).toBe('/bn/guide/unchanged/')
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
})

describe('document language', () => {
  it('emits the active locale language on the document element during SSR', () => {
    document.documentElement.lang = 'en'
    setPage('/guide/')
    render(GlobalLayout)
    expect(document.documentElement.lang).toBe('en')
  })

  it('updates the document language to the Chinese locale on the client', () => {
    setPage('/zh/guide/')
    render(GlobalLayout)
    expect(document.documentElement.lang).toBe('zh')
  })

  it('updates the document language to the Bengali locale on the client', () => {
    setPage('/bn/guide/')
    render(GlobalLayout)
    expect(document.documentElement.lang).toBe('bn')
  })

  it('keeps the default language without locales', () => {
    setLocaleFixtures(null)
    setPage('/guide/')
    render(GlobalLayout)
    expect(document.documentElement.lang).toBe('')
  })
})
