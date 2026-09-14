// @vitest-environment happy-dom

import { cleanup, render, waitFor, within } from '@testing-library/svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BASIC_WRITING_SLUG, githubImportPath, shippingEntries } from '../src/lib/playground/catalog.ts'
import PlaygroundApp from '../src/lib/playground/PlaygroundApp.svelte'

afterEach(cleanup)

describe('hosted editor wrapper', () => {
  it('auto-boots embedGithubProject with the tagged tree, Focused file, and theme', async () => {
    const entry = shippingEntries()[0]!
    const embed = vi.fn(async () => ({}))
    render(PlaygroundApp, {
      locale: 'en',
      slug: BASIC_WRITING_SLUG,
      theme: 'light',
      embed,
    })
    await waitFor(() => expect(embed).toHaveBeenCalledTimes(1))
    const [element, projectPath, options] = embed.mock.calls[0]!
    expect(element).toBeInstanceOf(HTMLElement)
    expect(projectPath).toBe(githubImportPath(entry))
    expect(options).toMatchObject({
      openFile: entry.focusedFile,
      clickToLoad: false,
      theme: 'light',
      height: '100%',
    })
  })

  it('replaces a failed boot with Open in StackBlitz in place', async () => {
    const embed = vi.fn(async () => {
      throw new Error('blocked')
    })
    const view = render(PlaygroundApp, {
      locale: 'en',
      slug: BASIC_WRITING_SLUG,
      embed,
    })
    await waitFor(() => {
      expect(
        within(view.getByRole('region', { name: 'Hosted editor' })).getByRole('link', {
          name: 'Open in StackBlitz',
        }),
      ).toBeTruthy()
    })
    const fallback = within(view.getByRole('region', { name: 'Hosted editor' })).getByRole(
      'link',
      { name: 'Open in StackBlitz' },
    )
    expect(fallback.getAttribute('href')).toBe(
      'https://stackblitz.com/fork/github/SveltePress/playground-starters/tree/playground-v1/default-theme',
    )
    expect(fallback.getAttribute('target')).toBe('_blank')
    expect(view.getByRole('region', { name: 'Hosted editor' }).textContent).toMatch(
      /does not carry/i,
    )
    expect(view.container.textContent).not.toMatch(/Teams|paywall|Personal\+/i)
  })
})
