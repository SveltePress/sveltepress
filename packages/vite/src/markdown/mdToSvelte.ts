import { compile } from 'mdsvex'
import type { MdsvexOptions } from 'mdsvex'
import LRUCache from 'lru-cache'
import type { Highlighter } from '../types.js'
const cache = new LRUCache<string, any>({ max: 1024 })

export default async ({ mdContent, filename, mdsvexOptions }: {
  mdContent: string
  filename: string
  highlighter?: Highlighter
  mdsvexOptions?: MdsvexOptions
}) => {
  const cacheKey = JSON.stringify({ filename, mdContent })
  const cached = cache.get(cacheKey)
  if (cached)
    return cached
  const transformedSvelteCode = await compile(mdContent, {
    extensions: ['.md'],
    filename,
    ...mdsvexOptions,
  }) || { code: '', data: {} }
  cache.set(cacheKey, transformedSvelteCode)

  return transformedSvelteCode
}
