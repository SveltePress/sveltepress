// @vitest-environment happy-dom

import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { get } from 'svelte/store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { darkMode, isDark } from '../src/components/layout'
import ToggleDark from '../src/components/ToggleDark.svelte'

const STORAGE_KEY = 'SVELTEPRESS_DARK_MODE'
const html = document.documentElement

let systemPrefersDark = false
let prefersReducedMotion = false

function stubMatchMedia() {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    media: query,
    matches: query.includes('prefers-color-scheme')
      ? systemPrefersDark
      : query.includes('prefers-reduced-motion')
        ? prefersReducedMotion
        : false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as MediaQueryList)
}

/** The view transition API as browsers that ship it expose it. */
function stubViewTransitions() {
  const startViewTransition = vi.fn((update: () => unknown) => {
    const done = Promise.resolve(update())
    return { ready: done, finished: done, updateCallbackDone: done }
  })
  Object.defineProperty(document, 'startViewTransition', { value: startViewTransition, configurable: true, writable: true })
  html.animate = vi.fn() as unknown as typeof html.animate
  return startViewTransition
}

function removeViewTransitions() {
  Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true, writable: true })
}

function toggleButton(view: ReturnType<typeof render>) {
  return view.getByRole('button', { name: /dark mode/i })
}

/** What a reader sees: the stored choice, and whether the page is dark. */
function appearance() {
  return {
    mode: get(darkMode),
    stored: localStorage.getItem(STORAGE_KEY),
    dark: html.classList.contains('dark'),
  }
}

beforeEach(() => {
  systemPrefersDark = false
  prefersReducedMotion = false
  localStorage.clear()
  html.classList.remove('dark')
  darkMode.set('auto')
  isDark.set(false)
  stubMatchMedia()
  removeViewTransitions()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('dark mode toggle', () => {
  it('cycles light, dark and system in a browser without view transitions', async () => {
    localStorage.setItem(STORAGE_KEY, 'light')
    const button = toggleButton(render(ToggleDark))
    expect(appearance()).toEqual({ mode: 'light', stored: 'light', dark: false })

    await fireEvent.click(button)
    expect(appearance()).toEqual({ mode: 'dark', stored: 'dark', dark: true })

    await fireEvent.click(button)
    expect(appearance()).toEqual({ mode: 'auto', stored: 'auto', dark: false })

    await fireEvent.click(button)
    expect(appearance()).toEqual({ mode: 'light', stored: 'light', dark: false })
  })

  it('follows a dark system when the choice returns to system', async () => {
    systemPrefersDark = true
    localStorage.setItem(STORAGE_KEY, 'dark')
    const button = toggleButton(render(ToggleDark))

    await fireEvent.click(button)

    expect(appearance()).toEqual({ mode: 'auto', stored: 'auto', dark: true })
  })

  it('switches without animating when the reader asks for reduced motion', async () => {
    prefersReducedMotion = true
    const startViewTransition = stubViewTransitions()
    localStorage.setItem(STORAGE_KEY, 'light')
    const button = toggleButton(render(ToggleDark))

    await fireEvent.click(button)

    expect(appearance()).toEqual({ mode: 'dark', stored: 'dark', dark: true })
    expect(startViewTransition).not.toHaveBeenCalled()
  })

  it('animates the change where view transitions are available', async () => {
    const startViewTransition = stubViewTransitions()
    localStorage.setItem(STORAGE_KEY, 'light')
    const button = toggleButton(render(ToggleDark))

    await fireEvent.click(button)

    expect(startViewTransition).toHaveBeenCalledTimes(1)
    await vi.waitFor(() => {
      expect(appearance()).toEqual({ mode: 'dark', stored: 'dark', dark: true })
    })
  })

  it('tells the rest of the theme the page is dark when dark was chosen earlier', () => {
    // Other components read the store, for example to pick the dark web
    // manifest, so it has to be right from the first render and not only
    // after the first click.
    localStorage.setItem(STORAGE_KEY, 'dark')
    render(ToggleDark)

    expect(get(isDark)).toBe(true)
    expect(appearance()).toEqual({ mode: 'dark', stored: 'dark', dark: true })
  })

  it('is a real button, so Enter and Space activate it', () => {
    const button = toggleButton(render(ToggleDark))

    expect(button.tagName).toBe('BUTTON')
    expect(button.getAttribute('type')).toBe('button')
  })
})

describe('the script that sets the colour scheme before first paint', () => {
  /** Runs the inline script the component puts in the document head. */
  function runBootScript() {
    render(ToggleDark)
    const script = [...document.head.querySelectorAll('script')]
      .find(element => element.textContent?.includes(STORAGE_KEY))
    expect(script, 'the boot script is rendered into the head').toBeTruthy()
    return (reset: () => void) => {
      // Mounting already applied a mode. Put the page back to what the script
      // finds on a fresh load, then run only the script.
      html.classList.remove('dark')
      localStorage.clear()
      reset()
      // eslint-disable-next-line no-new-func
      new Function(script!.textContent!)()
    }
  }

  it('goes dark on a first visit when the system is dark', () => {
    systemPrefersDark = true
    const run = runBootScript()

    run(() => {})

    expect(html.classList.contains('dark')).toBe(true)
  })

  it('stays light on a first visit when the system is light', () => {
    const run = runBootScript()

    run(() => {})

    expect(html.classList.contains('dark')).toBe(false)
  })

  it('keeps an explicit light choice on a dark system', () => {
    systemPrefersDark = true
    const run = runBootScript()

    run(() => localStorage.setItem(STORAGE_KEY, 'light'))

    expect(html.classList.contains('dark')).toBe(false)
  })

  it('keeps an explicit dark choice on a light system', () => {
    const run = runBootScript()

    run(() => localStorage.setItem(STORAGE_KEY, 'dark'))

    expect(html.classList.contains('dark')).toBe(true)
  })
})
