// @vitest-environment happy-dom

import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Navbar from '../src/components/Navbar.svelte'
import PageLayout from '../src/components/PageLayout.svelte'
import VersionChanges from '../src/components/VersionChanges.svelte'
import VersionFallbackNotice from '../src/components/VersionFallbackNotice.svelte'
import VersionLifecycleBanner from '../src/components/VersionLifecycleBanner.svelte'
import VersionSelector from '../src/components/VersionSelector.svelte'
import { setPage } from './fixtures/app-state.svelte'
import { gotoCalls, resetNavigation } from './fixtures/navigation'

beforeEach(() => {
  setPage('/guide/')
  window.history.replaceState({}, '', '/guide/')
  resetNavigation()
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

  it('renders localized lifecycle and missing-page notices', () => {
    setPage('/v/2026-08-27/guide/')
    const lifecycle = render(VersionLifecycleBanner)
    expect(lifecycle.getByRole('complementary', { name: '已弃用' }).textContent).toContain('此版本已弃用。')
    expect(lifecycle.getByRole('link', { name: '查看当前文档' }).getAttribute('href')).toBe('/guide/')

    cleanup()
    window.history.replaceState({}, '', '/v/2026-08-27/?svp-version-fallback=1')
    const fallback = render(VersionFallbackNotice)
    expect(fallback.getByRole('status').textContent).toBe('所选版本没有此页面，已返回版本首页。')
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

  it('renders both change groups with exact current links', () => {
    setPage('/whats-new/')
    const view = render(VersionChanges)
    expect(view.getByRole('combobox', { name: '查看版本变化' })).toBeTruthy()
    expect(view.getByRole('heading', { name: '新增页面' })).toBeTruthy()
    expect(view.getByRole('link', { name: 'New guide' }).getAttribute('href')).toBe('/guide/new/')
    expect(view.getByRole('heading', { name: '更新页面' })).toBeTruthy()
    expect(view.getByRole('link', { name: 'Hot reload' }).getAttribute('href')).toBe('/guide/#hot-reload')
  })

  it('switches the overview through URL state and uses historical links', async () => {
    setPage('/whats-new/?version=2026-08-26')
    let view = render(VersionChanges)
    expect(view.getByRole('status').textContent).toContain('首个版本')
    expect(view.getByRole('heading', { name: '新增页面' })).toBeTruthy()
    expect(view.getByRole('heading', { name: '更新页面' })).toBeTruthy()

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
