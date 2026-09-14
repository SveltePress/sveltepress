// @vitest-environment happy-dom

import { cleanup, render } from '@testing-library/svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BASIC_WRITING_SLUG } from '../src/lib/playground/catalog.ts'
import PlaygroundApp from '../src/lib/playground/PlaygroundApp.svelte'

const embed = vi.fn(async () => ({}))

afterEach(() => {
  cleanup()
  embed.mockClear()
})

describe('playground Pagefind body', () => {
  it('indexes the catalog home and ignores any Hosted editor', () => {
    const view = render(PlaygroundApp, { locale: 'en', embed })
    const body = view.container.querySelector('[data-pagefind-body]')
    expect(body).not.toBeNull()
    expect(body?.textContent).toContain('Basic Writing')
    expect(body?.textContent).toContain('Internationalization')
    expect(body?.textContent).toContain('Navbar')
    expect(body?.textContent).toContain('Vite plugin')
    expect(body?.textContent).toContain('Default theme features')
    expect(body?.textContent).toContain('Reference')
    expect(body?.textContent).toContain('Working with TypeScript')
    expect(body?.textContent).toContain('Document versions')
    expect(body?.textContent).toContain('Configuration')
    expect(body?.textContent).toContain('Writing posts')
    expect(body?.textContent).toContain('Customisation')
    expect(body?.textContent).toContain('27 Entries')
    expect(view.container.querySelector('[data-pagefind-ignore]')).toBeNull()
    expect(view.queryByRole('region', { name: 'Hosted editor' })).toBeNull()
    expect(view.getAllByRole('link', { name: /kitchen sink/i })[0]?.getAttribute('href')).toBe(
      '/playground/kitchen-sink/',
    )
    expect(body?.textContent).toContain('Kitchen sink')
    expect(body?.textContent).toContain('Virtual modules')
    expect(body?.textContent).toContain('All features')
    expect(embed).not.toHaveBeenCalled()
  })

  it('indexes the Entry strip and ignores the Hosted editor region', () => {
    const view = render(PlaygroundApp, {
      locale: 'en',
      slug: BASIC_WRITING_SLUG,
      embed,
    })
    const strip = view.container.querySelector('[data-pagefind-body]')
    const editor = view.getByRole('region', { name: 'Hosted editor' })
    expect(strip).not.toBeNull()
    expect(strip?.textContent).toContain('Basic Writing')
    expect(strip?.textContent).not.toContain('27 Entries')
    expect(editor.getAttribute('data-pagefind-ignore')).toBe('all')
    expect(strip?.contains(editor)).toBe(false)
  })
})
