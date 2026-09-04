import { describe, expect, it, vi } from 'vitest'

const capturedPwaOptions: any[] = []

vi.mock('@vite-pwa/sveltekit', () => ({
  SvelteKitPWA: vi.fn((options) => {
    capturedPwaOptions.push(options)
    return {
      name: 'mock-pwa-plugin',
      _options: options,
    }
  }),
}))

vi.mock('../src/vite-plugins/create-pre-core-plugins.js', () => ({
  default: vi.fn().mockResolvedValue([]),
}))

describe('theme-default PWA configuration', () => {
  it('configures runtime caching and limits precache to root page by default', async () => {
    capturedPwaOptions.length = 0
    const { defaultTheme } = await import('../src/index')

    const theme = defaultTheme({
      pwa: {
        scope: '/',
      },
    })

    const dummyCore = { name: 'core-plugin' }
    await (theme.vitePlugins as any)(dummyCore)

    expect(capturedPwaOptions).toHaveLength(1)
    const pwa = capturedPwaOptions[0]

    // Precache patterns should only include static assets and root page, NOT all prerendered html
    expect(pwa.injectManifest.globPatterns).toEqual([
      'client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}',
      'prerendered/pages/index.html',
    ])
    expect(pwa.workbox.globPatterns).toEqual([
      'client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}',
      'prerendered/pages/index.html',
    ])

    // Runtime caching should be registered for document navigation
    const navCaching = pwa.workbox.runtimeCaching.find(
      (rc: any) => typeof rc.urlPattern === 'function',
    )
    expect(navCaching).toBeDefined()
    expect(navCaching.handler).toBe('NetworkFirst')
    expect(navCaching.options.cacheName).toBe('sveltepress-pages')
    expect(navCaching.options.expiration.maxEntries).toBe(50)

    // dontCacheBustURLsMatching should be configured
    expect(pwa.injectManifest.dontCacheBustURLsMatching).toBeDefined()
    expect(pwa.workbox.dontCacheBustURLsMatching).toBeDefined()
  })

  it('allows opting into full page precaching via precachePages', async () => {
    capturedPwaOptions.length = 0
    const { defaultTheme } = await import('../src/index')

    const theme = defaultTheme({
      pwa: {
        scope: '/',
        precachePages: true,
      },
    })

    const dummyCore = { name: 'core-plugin' }
    await (theme.vitePlugins as any)(dummyCore)

    expect(capturedPwaOptions).toHaveLength(1)
    const pwa = capturedPwaOptions[0]

    expect(pwa.injectManifest.globPatterns).toEqual([
      'client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}',
      'prerendered/**/*.html',
    ])
    expect(pwa.workbox.globPatterns).toEqual([
      'client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}',
      'prerendered/**/*.html',
    ])
    // When precaching all pages, docPagesRuntimeCaching is not added
    const navCaching = pwa.workbox.runtimeCaching.find(
      (rc: any) => rc.options?.cacheName === 'sveltepress-pages',
    )
    expect(navCaching).toBeUndefined()
  })

  it('preserves user custom runtimeCaching and overrides', async () => {
    capturedPwaOptions.length = 0
    const { defaultTheme } = await import('../src/index')

    const customRule = {
      urlPattern: /^https:\/\/api\.example\.com\//,
      handler: 'NetworkFirst',
      options: { cacheName: 'api-cache' },
    }

    const theme = defaultTheme({
      pwa: {
        scope: '/',
        workbox: {
          runtimeCaching: [customRule],
        },
      },
    })

    const dummyCore = { name: 'core-plugin' }
    await (theme.vitePlugins as any)(dummyCore)

    expect(capturedPwaOptions).toHaveLength(1)
    const pwa = capturedPwaOptions[0]

    // Custom rule should be present in runtimeCaching before general navigation fallback
    const customIndex = pwa.workbox.runtimeCaching.indexOf(customRule)
    expect(customIndex).toBeGreaterThanOrEqual(0)

    const docIndex = pwa.workbox.runtimeCaching.findIndex(
      (rc: any) => rc.options?.cacheName === 'sveltepress-pages',
    )
    expect(customIndex).toBeLessThan(docIndex)
  })
})
