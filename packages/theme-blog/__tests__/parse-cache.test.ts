import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { hashContent, loadCache, saveCache } from '../src/parse-cache.js'

let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'svp-cache-'))
})
afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('parse-cache', () => {
  it('produces stable hash for same content+config', () => {
    const h1 = hashContent('abc', { twoslash: true })
    const h2 = hashContent('abc', { twoslash: true })
    expect(h1).toBe(h2)
  })

  it('hash differs when config changes', () => {
    const h1 = hashContent('abc', { twoslash: true })
    const h2 = hashContent('abc', { twoslash: false })
    expect(h1).not.toBe(h2)
  })

  it('roundtrips cache entries', async () => {
    await saveCache(dir, { a: { hash: 'h1', parsed: { slug: 'a' } as any } })
    const loaded = await loadCache(dir)
    expect(loaded.a.hash).toBe('h1')
  })

  it('returns empty object when cache file absent', async () => {
    const loaded = await loadCache(dir)
    expect(loaded).toEqual({})
  })

  it('returns empty on malformed JSON', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    await mkdir(join(dir, '.sveltepress/cache'), { recursive: true })
    await writeFile(join(dir, '.sveltepress/cache/blog-posts.json'), '{not json')
    const loaded = await loadCache(dir)
    expect(loaded).toEqual({})
  })

  it('drops entries whose shape is invalid', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    await mkdir(join(dir, '.sveltepress/cache'), { recursive: true })
    await writeFile(
      join(dir, '.sveltepress/cache/blog-posts.json'),
      JSON.stringify({
        ok: { hash: 'h', parsed: { slug: 'ok' } },
        badHash: { hash: 123, parsed: { slug: 'x' } },
        missingParsed: { hash: 'h' },
        nullish: null,
        arrayed: [],
      }),
    )
    const loaded = await loadCache(dir)
    expect(Object.keys(loaded)).toEqual(['ok'])
  })

  it('rejects arrays at the top level', async () => {
    const { writeFile, mkdir } = await import('node:fs/promises')
    await mkdir(join(dir, '.sveltepress/cache'), { recursive: true })
    await writeFile(join(dir, '.sveltepress/cache/blog-posts.json'), '[]')
    const loaded = await loadCache(dir)
    expect(loaded).toEqual({})
  })

  it('writes cache atomically (no stray tmp files remain)', async () => {
    const { readdir } = await import('node:fs/promises')
    await saveCache(dir, { a: { hash: 'h', parsed: { slug: 'a' } as any } })
    const files = await readdir(join(dir, '.sveltepress/cache'))
    expect(files).toEqual(['blog-posts.json'])
  })
})
