import { describe, expect, it } from 'vitest'
import {
  prefixToPrerenderedGlobs,
  PWA_ALL_HTML_GLOB,
  PWA_CLIENT_ASSETS_GLOB,
  PWA_CLIENT_ENTRY_GLOB,
  PWA_CLIENT_GLOB,
  PWA_CLIENT_ROOT_ICONS_GLOB,
  PWA_HOME_GLOB,
  resolvePrecacheGlobPatterns,
  shouldRuntimeCachePages,
} from '../src/pwa/precache-pages'

const SHELL_CLIENT_GLOBS = [
  PWA_CLIENT_ENTRY_GLOB,
  PWA_CLIENT_ASSETS_GLOB,
  PWA_CLIENT_ROOT_ICONS_GLOB,
]

function expectNoCatchAllOrRouteModules(patterns: string[]) {
  expect(patterns).not.toContain(PWA_CLIENT_GLOB)
  expect(patterns.some(g => g.includes('nodes/'))).toBe(false)
  expect(patterns.some(g => g.includes('chunks/'))).toBe(false)
}

describe('prefixToPrerenderedGlobs', () => {
  it('maps homepage prefixes to the index.html glob', () => {
    expect(prefixToPrerenderedGlobs('/')).toEqual([PWA_HOME_GLOB])
    expect(prefixToPrerenderedGlobs('')).toEqual([PWA_HOME_GLOB])
  })

  it('maps a locale/version prefix to file + directory globs', () => {
    expect(prefixToPrerenderedGlobs('/zh/')).toEqual([
      'prerendered/pages/zh.html',
      'prerendered/pages/zh/**',
    ])
    expect(prefixToPrerenderedGlobs('v/2026-08-27')).toEqual([
      'prerendered/pages/v/2026-08-27.html',
      'prerendered/pages/v/2026-08-27/**',
    ])
  })
})

describe('resolvePrecacheGlobPatterns', () => {
  it('defaults to app-shell client files and homepage-only HTML', () => {
    const expected = [...SHELL_CLIENT_GLOBS, PWA_HOME_GLOB]
    expect(resolvePrecacheGlobPatterns()).toEqual(expected)
    expect(resolvePrecacheGlobPatterns(false)).toEqual(expected)
    expectNoCatchAllOrRouteModules(expected)
  })

  it('includes a prerendered/ glob so sveltekit-pwa does not add the catch-all', () => {
    for (const value of [false, true, ['/zh/']] as const) {
      expect(resolvePrecacheGlobPatterns(value).some(g => g.startsWith('prerendered/'))).toBe(true)
    }
  })

  it('can restore the old full HTML precache without restoring every client file', () => {
    expect(resolvePrecacheGlobPatterns(true)).toEqual([
      ...SHELL_CLIENT_GLOBS,
      PWA_ALL_HTML_GLOB,
    ])
    expectNoCatchAllOrRouteModules(resolvePrecacheGlobPatterns(true))
  })

  it('precaches homepage plus selected version/locale prefixes', () => {
    expect(resolvePrecacheGlobPatterns(['/zh/', '/v/2026-08-27/'])).toEqual([
      ...SHELL_CLIENT_GLOBS,
      PWA_HOME_GLOB,
      'prerendered/pages/zh.html',
      'prerendered/pages/zh/**',
      'prerendered/pages/v/2026-08-27.html',
      'prerendered/pages/v/2026-08-27/**',
    ])
  })

  it('deduplicates homepage when it is also listed as a prefix', () => {
    const patterns = resolvePrecacheGlobPatterns(['/', '/zh/'])
    expect(patterns.filter(g => g === PWA_HOME_GLOB)).toHaveLength(1)
  })

  it('restores the catch-all client glob when precacheClient is true', () => {
    expect(resolvePrecacheGlobPatterns(false, true)).toEqual([
      PWA_CLIENT_GLOB,
      PWA_HOME_GLOB,
    ])
    expect(resolvePrecacheGlobPatterns(true, true)).toEqual([
      PWA_CLIENT_GLOB,
      PWA_ALL_HTML_GLOB,
    ])
    expect(resolvePrecacheGlobPatterns(['/zh/'], true)).toEqual([
      PWA_CLIENT_GLOB,
      PWA_HOME_GLOB,
      'prerendered/pages/zh.html',
      'prerendered/pages/zh/**',
    ])
  })
})

describe('shouldRuntimeCachePages', () => {
  it('runtime-caches pages unless every HTML file is already precached', () => {
    expect(shouldRuntimeCachePages()).toBe(true)
    expect(shouldRuntimeCachePages(false)).toBe(true)
    expect(shouldRuntimeCachePages(['/zh/'])).toBe(true)
    expect(shouldRuntimeCachePages(true)).toBe(false)
  })
})
