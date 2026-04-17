import type { ParsedPost } from './parse-post.js'
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const CACHE_DIR = '.sveltepress/cache'
const CACHE_FILE = 'blog-posts.json'

/**
 * Bump when the parse pipeline changes shape in a way old entries
 * cannot be trusted — e.g. Shiki/remark/rehype plugin upgrades, or
 * changes to ParsedPost fields. Included in every entry's hash.
 */
const CACHE_VERSION = 2

export interface CacheEntry {
  hash: string
  parsed: ParsedPost
}

export type Cache = Record<string, CacheEntry>

export function hashContent(raw: string, config: unknown): string {
  return createHash('sha256')
    .update(String(CACHE_VERSION))
    .update('\0')
    .update(raw)
    .update('\0')
    .update(JSON.stringify(config ?? null))
    .digest('hex')
}

function isValidEntry(v: unknown): v is CacheEntry {
  if (!v || typeof v !== 'object')
    return false
  const e = v as Record<string, unknown>
  return typeof e.hash === 'string' && !!e.parsed && typeof e.parsed === 'object'
}

export async function loadCache(root: string): Promise<Cache> {
  try {
    const text = await readFile(join(root, CACHE_DIR, CACHE_FILE), 'utf-8')
    const obj = JSON.parse(text)
    if (!obj || typeof obj !== 'object' || Array.isArray(obj))
      return {}
    const out: Cache = {}
    for (const [slug, entry] of Object.entries(obj)) {
      if (isValidEntry(entry))
        out[slug] = entry
    }
    return out
  }
  catch { /* missing or malformed — start fresh */ }
  return {}
}

export async function saveCache(root: string, cache: Cache): Promise<void> {
  const dir = join(root, CACHE_DIR)
  await mkdir(dir, { recursive: true })
  const target = join(dir, CACHE_FILE)
  const tmp = `${target}.${process.pid}.tmp`
  await writeFile(tmp, JSON.stringify(cache), 'utf-8')
  await rename(tmp, target)
}
