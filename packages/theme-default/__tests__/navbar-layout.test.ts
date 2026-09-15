// @vitest-environment happy-dom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, render } from '@testing-library/svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Navbar from '../src/components/Navbar.svelte'
import { setPage } from './fixtures/app-state.svelte'
import { localeFixture, setLocaleFixtures } from './fixtures/locale'
import { resetNavigation } from './fixtures/navigation'
import themeOptions from './fixtures/theme-options'

const originalThemeSearch = themeOptions.search
const navbarSource = readFileSync(
  resolve(import.meta.dirname, '../src/components/Navbar.svelte'),
  'utf8',
)
const localSearchSource = readFileSync(
  resolve(import.meta.dirname, '../src/components/search/LocalSearch.svelte'),
  'utf8',
)
const themeCss = readFileSync(
  resolve(import.meta.dirname, '../src/style.css'),
  'utf8',
)

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

describe('desktop navbar search slot', () => {
  it('gives leftover width to search and keeps nav links from shrinking under the pill', () => {
    expect(navbarSource).toMatch(/\.doc-search \{[^}]*flex-grow/)
    expect(navbarSource).toMatch(/\.doc-search \{[^}]*min-w-0/)
    expect(navbarSource).toMatch(/\.doc-search \{[^}]*overflow-hidden/)
    expect(navbarSource).toMatch(/\.nav-links \{[^}]*flex-none/)
    expect(navbarSource).not.toMatch(/\.nav-links \{[^}]*flex-grow/)
  })

  it('lets the local search trigger shrink with its slot instead of overflowing onto the first nav item', () => {
    expect(localSearchSource).not.toContain('min-width: 140px')
    expect(localSearchSource).toMatch(/\.local-search-trigger \{[^}]*min-width:\s*0/)
    expect(localSearchSource).toMatch(/\.local-search-trigger \{[^}]*width:\s*100%/)
    expect(localSearchSource).toMatch(/\.local-search-trigger \{[^}]*max-width:\s*220px/)
    expect(localSearchSource).toContain('container-type: inline-size')
    expect(localSearchSource).toMatch(/@container \(max-width: 180px\)/)
  })

  it('caps DocSearch and local search widgets to the shrinking slot', () => {
    expect(navbarSource).toMatch(/\.doc-search :global\(\.local-search-trigger\)/)
    expect(navbarSource).toMatch(/\.doc-search :global\(\.DocSearch-Button\)/)
    expect(themeCss).toMatch(/html \.DocSearch-Button \{[^}]*min-width:\s*0/)
  })

  it('renders search beside the first desktop nav item on a crowded docs navbar', () => {
    const fixture = localeFixture()
    delete fixture['/']!.theme.search
    fixture['/']!.theme.navbar = [
      { title: 'Guide', to: '/guide/introduction/' },
      { title: 'What\'s new', to: '/whats-new/' },
      { title: 'Playground', to: '/playground/' },
      { title: 'Reference', to: '/reference/vite-plugin/' },
      { title: 'Blog theme', to: '/guide/blog-theme/getting-started/' },
      {
        title: 'Blog demo',
        to: 'https://sveltepress.github.io/sveltepress/blog-demo/',
        external: true,
      },
    ]
    setLocaleFixtures(fixture)

    const view = render(Navbar)
    const search = view.container.querySelector('.doc-search')
    const trigger = view.getByRole('button', { name: 'Search documentation...' })
    const guide = view.getByRole('link', { name: 'Guide' })

    expect(search?.contains(trigger)).toBe(true)
    expect(guide.getAttribute('href')).toBe('/guide/introduction/')
    expect(search?.contains(guide)).toBe(false)
  })
})
