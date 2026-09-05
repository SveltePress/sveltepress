import { describe, expect, it } from 'vitest'
import {
  prefixToPrerenderedGlobs,
  PWA_ALL_HTML_GLOB,
  PWA_CLIENT_GLOB,
  PWA_HOME_GLOB,
  resolvePrecacheGlobPatterns,
  shouldRuntimeCachePages,
} from '../src/pwa/precache-pages'

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
  it('defaults to homepage-only HTML so versioned/i18n sites stay small', () => {
    expect(resolvePrecacheGlobPatterns()).toEqual([PWA_CLIENT_GLOB, PWA_HOME_GLOB])
    expect(resolvePrecacheGlobPatterns(false)).toEqual([PWA_CLIENT_GLOB, PWA_HOME_GLOB])
  })

  it('includes a prerendered/ glob so sveltekit-pwa does not add the catch-all', () => {
    for (const value of [false, true, ['/zh/']] as const) {
      expect(resolvePrecacheGlobPatterns(value).some(g => g.startsWith('prerendered/'))).toBe(true)
    }
  })

  it('can restore the old full-precache behavior', () => {
    expect(resolvePrecacheGlobPatterns(true)).toEqual([
      PWA_CLIENT_GLOB,
      PWA_ALL_HTML_GLOB,
    ])
  })

  it('precaches homepage plus selected version/locale prefixes', () => {
    expect(resolvePrecacheGlobPatterns(['/zh/', '/v/2026-08-27/'])).toEqual([
      PWA_CLIENT_GLOB,
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
})

describe('shouldRuntimeCachePages', () => {
  it('runtime-caches pages unless every HTML file is already precached', () => {
    expect(shouldRuntimeCachePages()).toBe(true)
    expect(shouldRuntimeCachePages(false)).toBe(true)
    expect(shouldRuntimeCachePages(['/zh/'])).toBe(true)
    expect(shouldRuntimeCachePages(true)).toBe(false)
  })
})
