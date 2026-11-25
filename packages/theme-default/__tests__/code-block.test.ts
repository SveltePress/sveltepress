// @vitest-environment happy-dom

import { cleanup, render } from '@testing-library/svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CodeBlock from '../src/components/CodeBlock.svelte'
import { resolveShikiThemes } from '../src/shiki-themes'
import themeOptions from './fixtures/theme-options'

// The component highlights in the browser with the full shiki bundle. What
// matters here is which themes it asks for, so shiki reports them back.
vi.mock('shiki', () => ({
  codeToHtml: vi.fn(async (code: string, options: { lang: string, themes: { light: string, dark: string } }) =>
    `<pre data-lang="${options.lang}" data-light="${options.themes.light}" data-dark="${options.themes.dark}">${code}</pre>`),
}))

const options = themeOptions as { highlighter?: { themeLight?: string, themeDark?: string } }

afterEach(() => {
  cleanup()
  delete options.highlighter
})

async function renderedBlock() {
  const view = render(CodeBlock, { lang: 'ts', code: 'const answer = 42' })
  return vi.waitFor(() => {
    const block = view.container.querySelector('pre')
    expect(block).toBeTruthy()
    return block!
  })
}

describe('client side code block', () => {
  it('renders with the default themes when no highlighter is configured', async () => {
    const block = await renderedBlock()

    expect(block.dataset.light).toBe('vitesse-light')
    expect(block.dataset.dark).toBe('night-owl')
    expect(block.textContent).toBe('const answer = 42')
  })

  it('uses the configured light theme in light mode and the dark theme in dark mode', async () => {
    options.highlighter = { themeLight: 'github-light', themeDark: 'github-dark' }

    const block = await renderedBlock()

    expect(block.dataset.light).toBe('github-light')
    expect(block.dataset.dark).toBe('github-dark')
  })

  it('falls back per theme when only one is configured', async () => {
    options.highlighter = { themeDark: 'github-dark' }

    const block = await renderedBlock()

    expect(block.dataset.light).toBe('vitesse-light')
    expect(block.dataset.dark).toBe('github-dark')
  })
})

describe('resolveShikiThemes', () => {
  it('accepts a missing highlighter option', () => {
    expect(resolveShikiThemes(undefined)).toEqual({ light: 'vitesse-light', dark: 'night-owl' })
  })

  it('keeps light and dark apart', () => {
    expect(resolveShikiThemes({ themeLight: 'github-light', themeDark: 'github-dark' }))
      .toEqual({ light: 'github-light', dark: 'github-dark' })
  })
})
