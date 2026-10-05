import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { assertSingleSvelteKit } from '../src/plugin'
import { assertNoSvelteConfigFile, resolveSvelteKitOptions } from '../src/utils/resolve-svelte-kit-options'

describe('resolveSvelteKitOptions', () => {
  it('returns undefined on SvelteKit 2 when no options are provided (classic svelte.config.js layout)', () => {
    expect(resolveSvelteKitOptions(undefined, '2.70.3')).toBeUndefined()
  })

  it('always forwards options with `.md` on SvelteKit 3, which no longer reads svelte.config.js', () => {
    expect(resolveSvelteKitOptions(undefined, '3.0.0')).toEqual({ extensions: ['.svelte', '.md'] })
    expect(resolveSvelteKitOptions({ extensions: ['.svx'] }, '3.0.0')!.extensions).toEqual(['.svx', '.md'])
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

describe('assertNoSvelteConfigFile', () => {
  let root: string | undefined

  afterEach(() => {
    if (root)
      rmSync(root, { recursive: true, force: true })
    root = undefined
  })

  function createRoot(files: string[]) {
    root = mkdtempSync(join(tmpdir(), 'sveltepress-svelte-config-'))
    for (const file of files)
      writeFileSync(join(root, file), 'export default {}')
    return root
  }

  it('allows svelte.config.js on SvelteKit 2', () => {
    expect(() => assertNoSvelteConfigFile(createRoot(['svelte.config.js']), '2.70.3')).not.toThrow()
  })

  it('allows SvelteKit 3 projects without svelte.config.js', () => {
    expect(() => assertNoSvelteConfigFile(createRoot([]), '3.0.0')).not.toThrow()
  })

  it('points SvelteKit 3 users with svelte.config.js at svelteKitOptions', () => {
    expect(() => assertNoSvelteConfigFile(createRoot(['svelte.config.ts']), '3.0.0'))
      .toThrow(/no longer reads `svelte\.config\.ts`[\s\S]*svelteKitOptions/)
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
