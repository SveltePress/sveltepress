import { describe, expect, it } from 'vitest'
import { assertSingleSvelteKit } from '../src/plugin'
import { resolveSvelteKitOptions } from '../src/utils/resolve-svelte-kit-options'

describe('resolveSvelteKitOptions', () => {
  it('returns undefined when no options are provided (classic svelte.config.js layout)', () => {
    expect(resolveSvelteKitOptions()).toBeUndefined()
    expect(resolveSvelteKitOptions(undefined)).toBeUndefined()
  })

  it('adds `.md` to the default extensions when options are provided', () => {
    expect(resolveSvelteKitOptions({})!.extensions).toEqual(['.svelte', '.md'])
  })

  it('merges `.md` into user provided extensions without duplicating it', () => {
    expect(resolveSvelteKitOptions({ extensions: ['.svelte'] })!.extensions).toEqual(['.svelte', '.md'])
    expect(resolveSvelteKitOptions({ extensions: ['.svelte', '.md'] })!.extensions).toEqual(['.svelte', '.md'])
    expect(resolveSvelteKitOptions({ extensions: ['.svx'] })!.extensions).toEqual(['.svx', '.md'])
  })

  it('preserves other forwarded SvelteKit options', () => {
    const adapter = { name: 'my-adapter' } as any
    const compilerOptions = { runes: true } as any
    const resolved = resolveSvelteKitOptions({ adapter, compilerOptions })
    expect(resolved!.adapter).toBe(adapter)
    expect(resolved!.compilerOptions).toBe(compilerOptions)
  })
})

describe('assertSingleSvelteKit', () => {
  it('does not throw when there is a single vite-plugin-svelte instance', () => {
    expect(() => assertSingleSvelteKit([
      { name: '@sveltepress/vite' },
      { name: 'vite-plugin-svelte' },
      { name: 'vite-plugin-svelte-module' },
    ])).not.toThrow()
  })

  it('does not throw when there is no vite-plugin-svelte instance', () => {
    expect(() => assertSingleSvelteKit([{ name: 'some-plugin' }])).not.toThrow()
  })

  it('throws a helpful error when a standalone sveltekit() plugin is also present', () => {
    expect(() => assertSingleSvelteKit([
      { name: 'vite-plugin-svelte' },
      { name: '@sveltepress/vite' },
      { name: 'vite-plugin-svelte' },
    ])).toThrow(/Detected more than one SvelteKit/)
  })
})
