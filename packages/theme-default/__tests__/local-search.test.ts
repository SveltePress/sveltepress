// @vitest-environment happy-dom

import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Navbar from '../src/components/Navbar.svelte'
import LocalSearch from '../src/components/search/LocalSearch.svelte'
import { setPage } from './fixtures/app-state.svelte'
import { localeFixture, setLocaleFixtures } from './fixtures/locale'
import { resetNavigation } from './fixtures/navigation'
import themeOptions from './fixtures/theme-options'

const originalThemeSearch = themeOptions.search

beforeEach(() => {
  setPage('/guide/')
  window.history.replaceState({}, '', '/guide/')
  resetNavigation()
  setLocaleFixtures(localeFixture())
  themeOptions.search = undefined
})

afterEach(() => {
  cleanup()
  setLocaleFixtures(null)
  themeOptions.search = originalThemeSearch
})

describe('localSearch component', () => {
  it('renders search trigger button with default placeholder and shortcut', () => {
    const view = render(LocalSearch)
    const trigger = view.getByRole('button', { name: 'Search documentation...' })
    expect(trigger).toBeDefined()
    expect(trigger.textContent).toContain('Search documentation...')
    expect(trigger.textContent).toContain('K')
  })

  it('renders localized placeholder when on a locale route', () => {
    setPage('/zh/guide/')
    const view = render(LocalSearch)
    const trigger = view.getByRole('button', { name: '搜索文档...' })
    expect(trigger).toBeDefined()
    expect(trigger.textContent).toContain('搜索文档...')
  })

  it('opens modal on click and closes on Escape button', async () => {
    const view = render(LocalSearch)
    const trigger = view.getByRole('button', { name: 'Search documentation...' })
    await fireEvent.click(trigger)
    await tick()

    const modal = view.getByRole('dialog', { name: 'Search documentation...' })
    expect(modal).toBeDefined()

    const escBtn = view.getByRole('button', { name: 'ESC' })
    await fireEvent.click(escBtn)
    await tick()

    expect(view.queryByRole('dialog')).toBeNull()
  })

  it('toggles modal via Cmd+K keyboard shortcut', async () => {
    const view = render(LocalSearch)
    expect(view.queryByRole('dialog')).toBeNull()

    // Press Cmd+K to open
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    await tick()

    expect(view.getByRole('dialog')).toBeDefined()

    // Press Cmd+K again to close
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    await tick()

    expect(view.queryByRole('dialog')).toBeNull()
  })

  it('closes on Escape keypress', async () => {
    const view = render(LocalSearch)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    await tick()
    expect(view.getByRole('dialog')).toBeDefined()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await tick()
    expect(view.queryByRole('dialog')).toBeNull()
  })

  it('displays dev mode notice when pagefind is not loaded', async () => {
    const view = render(LocalSearch)
    const trigger = view.getByRole('button', { name: 'Search documentation...' })
    await fireEvent.click(trigger)

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain(
        'Local search index is generated during production build.',
      )
    }, { timeout: 3000 })
  })

  it('clears query when clear button is clicked', async () => {
    const view = render(LocalSearch)
    const trigger = view.getByRole('button', { name: 'Search documentation...' })
    await fireEvent.click(trigger)
    await tick()

    const input = view.getByPlaceholderText('Search documentation...') as HTMLInputElement
    await fireEvent.input(input, { target: { value: 'svelte' } })
    await tick()

    expect(input.value).toBe('svelte')
    const clearBtn = view.getByRole('button', { name: 'Clear search' })
    await fireEvent.click(clearBtn)
    await tick()

    expect(input.value).toBe('')
  })

  it('mounts LocalSearch in Navbar when custom search is not provided', () => {
    const fixture = localeFixture()
    delete fixture['/'].theme.search
    setLocaleFixtures(fixture)

    setPage('/guide/')
    const view = render(Navbar)
    expect(view.getByRole('button', { name: 'Search documentation...' })).toBeDefined()
  })

  it('mounts localized LocalSearch in Navbar when custom search is not provided on a non-default locale', () => {
    const fixture = localeFixture()
    delete fixture['/'].theme.search
    delete fixture['/zh/'].theme.search
    setLocaleFixtures(fixture)

    setPage('/zh/guide/')
    const view = render(Navbar)
    expect(view.getByRole('button', { name: '搜索文档...' })).toBeDefined()
  })

  it('re-keys LocalSearch in Navbar when navigating across locales', async () => {
    const fixture = localeFixture()
    delete fixture['/'].theme.search
    delete fixture['/zh/'].theme.search
    setLocaleFixtures(fixture)

    setPage('/guide/')
    const view = render(Navbar)
    const enButton = view.getByRole('button', { name: 'Search documentation...' })
    expect(enButton).toBeDefined()

    // Navigating to /zh/guide/ switches the locale and remounts LocalSearch with the new key
    setPage('/zh/guide/')
    await tick()

    const zhButton = view.getByRole('button', { name: '搜索文档...' })
    expect(zhButton).toBeDefined()
    expect(zhButton).not.toBe(enButton)
  })

  it('mounts LocalSearch in Navbar on historical version routes', () => {
    const fixture = localeFixture()
    delete fixture['/'].theme.search
    setLocaleFixtures(fixture)

    setPage('/v/2026-08-27/guide/')
    const view = render(Navbar)
    expect(view.getByRole('button', { name: 'Search documentation...' })).toBeDefined()
    expect(view.queryByRole('status')).toBeNull()
  })

  it('renders LocalSearch on historical version route with localized placeholder and open modal', async () => {
    setPage('/v/2026-08-27/guide/')
    const view = render(LocalSearch)
    const trigger = view.getByRole('button', { name: 'Search documentation...' })
    await fireEvent.click(trigger)
    await tick()

    const modal = view.getByRole('dialog', { name: 'Search documentation...' })
    expect(modal).toBeDefined()
  })

  it('hides search in Navbar when search is disabled with search: false', () => {
    const fixture = localeFixture()
    fixture['/'].theme.search = false
    setLocaleFixtures(fixture)

    setPage('/guide/')
    const view = render(Navbar)
    expect(view.queryByRole('button', { name: 'Search documentation...' })).toBeNull()
  })

  it('renders .local-search-trigger on the search button for view-transition styling', () => {
    const view = render(LocalSearch)
    const trigger = view.getByRole('button', { name: 'Search documentation...' })
    expect(trigger.classList.contains('local-search-trigger')).toBe(true)
  })

  it('portals the overlay to document.body so it covers the sidebar and navbar', async () => {
    const fixture = localeFixture()
    delete fixture['/'].theme.search
    setLocaleFixtures(fixture)

    const view = render(Navbar)
    await fireEvent.click(view.getByRole('button', { name: 'Search documentation...' }))
    await tick()

    const backdrop = document.querySelector('.local-search-backdrop')
    expect(backdrop).not.toBeNull()
    expect(backdrop?.parentElement).toBe(document.body)

    const header = view.container.querySelector('header')
    expect(header).not.toBeNull()
    expect(header?.contains(backdrop)).toBe(false)

    const dialog = view.getByRole('dialog', { name: 'Search documentation...' })
    expect(backdrop?.contains(dialog)).toBe(true)
  })

  it('removes the portaled overlay from document.body when closed', async () => {
    const view = render(LocalSearch)
    await fireEvent.click(view.getByRole('button', { name: 'Search documentation...' }))
    await tick()
    expect(document.querySelector('.local-search-backdrop')).not.toBeNull()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await tick()
    expect(document.querySelector('.local-search-backdrop')).toBeNull()
  })
})
