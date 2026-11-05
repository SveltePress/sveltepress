import { describe, expect, it } from 'vitest'
import { resolveKitBase } from '../src/kit-base.js'

function kitPlugin(base?: string) {
  return {
    name: 'vite-plugin-sveltekit-setup',
    api: { options: { kit: { paths: base === undefined ? {} : { base } } } },
  }
}

describe('resolveKitBase', () => {
  it('ignores the relative Vite base SvelteKit sets for builds', () => {
    expect(resolveKitBase({ base: './', plugins: [kitPlugin('')] as any })).toBe('')
    expect(resolveKitBase({ base: './', plugins: [] })).toBe('')
  })

  it('reads paths.base from SvelteKit even when Vite base is relative', () => {
    expect(resolveKitBase({ base: './', plugins: [kitPlugin('/blog')] as any })).toBe('/blog')
  })

  it('falls back to an absolute Vite base without SvelteKit', () => {
    expect(resolveKitBase({ base: '/docs/', plugins: [] })).toBe('/docs')
    expect(resolveKitBase({ base: '/', plugins: [] })).toBe('')
    expect(resolveKitBase(undefined)).toBe('')
  })
})
