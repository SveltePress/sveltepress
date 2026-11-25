// @vitest-environment happy-dom

import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { afterEach, describe, expect, it } from 'vitest'
import { isDark } from '../src/components/layout'
import Pwa from '../src/components/pwa/Pwa.svelte'
import themeOptions from './fixtures/theme-options'

// `virtual:pwa-info` resolves to a fixture with no manifest of its own, so
// only the dark manifest the theme adds itself is under test.

const options = themeOptions as { pwa?: { darkManifest?: string } }

afterEach(() => {
  cleanup()
  delete options.pwa
  isDark.set(false)
})

describe('dark web manifest', () => {
  it('is linked with a link element, which is the only kind browsers read', async () => {
    options.pwa = { darkManifest: '/manifest-dark.webmanifest' }
    isDark.set(true)

    render(Pwa)
    await tick()

    const link = document.head.querySelector('link[rel="manifest"]')
    expect(link?.getAttribute('href')).toBe('/manifest-dark.webmanifest')
    expect(document.head.querySelector('meta[rel="manifest"]')).toBeNull()
  })

  it('is left out in light mode', async () => {
    options.pwa = { darkManifest: '/manifest-dark.webmanifest' }

    render(Pwa)
    await tick()

    expect(document.head.querySelector('[href="/manifest-dark.webmanifest"]')).toBeNull()
  })
})
