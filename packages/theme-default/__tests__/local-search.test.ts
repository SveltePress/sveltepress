// @vitest-environment happy-dom

import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import LocalSearch from '../src/components/search/LocalSearch.svelte'
import { setPage } from './fixtures/app-state.svelte'
import { localeFixture, setLocaleFixtures } from './fixtures/locale'
import { resetNavigation } from './fixtures/navigation'

beforeEach(() => {
  setPage('/guide/')
  window.history.replaceState({}, '', '/guide/')
  resetNavigation()
  setLocaleFixtures(localeFixture())
})

afterEach(() => {
  cleanup()
  setLocaleFixtures(null)
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
    await tick()

    // In happy-dom test environment, pagefind.js import will fail and trigger dev notice
    // Wait for the async loadPagefind() catch block
    await new Promise(resolve => setTimeout(resolve, 50))
    await tick()

    expect(view.container.textContent).toContain('Local search index is generated during production build.')
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
})
