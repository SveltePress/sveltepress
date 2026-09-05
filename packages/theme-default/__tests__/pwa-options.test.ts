import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

function expectNavigationFallbackDoesNotInterceptDocPages(workbox: any) {
  const allowlist = workbox.navigateFallbackAllowlist
  expect(allowlist, 'navigateFallbackAllowlist is required so generateSW does not match every document navigation').toBeDefined()
  expect(Array.isArray(allowlist)).toBe(true)
  expect(allowlist.some((re: RegExp) => re.test('/'))).toBe(true)
  expect(allowlist.some((re: RegExp) => re.test('/guide/markdown/frontmatter/'))).toBe(false)
}

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

    // generateSW registers navigateFallback BEFORE runtimeCaching.
    // An unrestricted fallback to '/' serves the homepage HTML on every
    // document-page refresh (sidebar/url stay correct, body is empty).
    expectNavigationFallbackDoesNotInterceptDocPages(pwa.workbox)
  })

  it('restricts navigateFallback when the site uses generateSW like docs-site', async () => {
    capturedPwaOptions.length = 0
    const { defaultTheme } = await import('../src/index')

    const theme = defaultTheme({
      pwa: {
        scope: '/',
        base: '/',
        strategies: 'generateSW',
        kit: { trailingSlash: 'always' },
      },
    })

    const dummyCore = { name: 'core-plugin' }
    await (theme.vitePlugins as any)(dummyCore)

    expect(capturedPwaOptions).toHaveLength(1)
    expectNavigationFallbackDoesNotInterceptDocPages(capturedPwaOptions[0].workbox)
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

  it('precaches selected URL prefixes via precachePages and still runtime-caches the rest', async () => {
    capturedPwaOptions.length = 0
    const { defaultTheme } = await import('../src/index')

    const theme = defaultTheme({
      pwa: {
        scope: '/',
        precachePages: ['/zh/', '/v/2026-08-27/'],
      },
    })

    const dummyCore = { name: 'core-plugin' }
    await (theme.vitePlugins as any)(dummyCore)

    expect(capturedPwaOptions).toHaveLength(1)
    const pwa = capturedPwaOptions[0]

    expect(pwa.injectManifest.globPatterns).toEqual([
      'client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}',
      'prerendered/pages/index.html',
      'prerendered/pages/zh.html',
      'prerendered/pages/zh/**',
      'prerendered/pages/v/2026-08-27.html',
      'prerendered/pages/v/2026-08-27/**',
    ])
    const navCaching = pwa.workbox.runtimeCaching.find(
      (rc: any) => rc.options?.cacheName === 'sveltepress-pages',
    )
    expect(navCaching).toBeDefined()
    expect(pwa.workbox.runtimeCaching.some(
      (rc: any) => rc.options?.cacheName === 'sveltepress-data',
    )).toBe(true)
    expect(pwa.workbox.runtimeCaching.some(
      (rc: any) => rc.options?.cacheName === 'sveltepress-images',
    )).toBe(true)
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

  it('restricts the injectManifest navigation fallback to the root route in production', () => {
    const sw = readFileSync(
      resolve(import.meta.dirname, '../src/components/pwa/sw.js'),
      'utf8',
    )
    expect(sw).toContain('allowlist: [/^\\/$/]')
    expect(sw).toContain('workbox-expiration')
    expect(sw).toContain('__data.json')
    expect(sw).not.toContain('import.meta.env.DEV')
  })
})
