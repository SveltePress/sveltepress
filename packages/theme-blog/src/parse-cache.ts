import type { ParsedPost } from './parse-post.js'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const CACHE_DIR = '.sveltepress/cache'
const CACHE_FILE = 'blog-posts.json'

export interface CacheEntry {
  hash: string
  parsed: ParsedPost
}

export type Cache = Record<string, CacheEntry>

export function hashContent(raw: string, config: unknown): string {
  return createHash('sha256')
    .update(raw)
    .update('\0')
    .update(JSON.stringify(config ?? null))
    .digest('hex')
}

export async function loadCache(root: string): Promise<Cache> {
  try {
    const text = await readFile(join(root, CACHE_DIR, CACHE_FILE), 'utf-8')
    const obj = JSON.parse(text)
    if (obj && typeof obj === 'object')
      return obj as Cache
  }
  catch { /* missing or malformed — start fresh */ }
  return {}
}

export async function saveCache(root: string, cache: Cache): Promise<void> {
  const dir = join(root, CACHE_DIR)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, CACHE_FILE), JSON.stringify(cache), 'utf-8')
}
