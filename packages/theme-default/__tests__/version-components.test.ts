// @vitest-environment happy-dom

import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Navbar from '../src/components/Navbar.svelte'
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
})
