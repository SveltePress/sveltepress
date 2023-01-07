import { compile } from 'mdsvex'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import admonitions from 'remark-admonitions'
import type { MdsvexOptions } from 'mdsvex'
import LRUCache from 'lru-cache'
import liveCode from './live-code.js'
import highlighter from './highlighter.js'
const cache = new LRUCache<string, any>({ max: 1024 })

export default async ({ mdContent, filename, mdsvexOptions }: {
  mdContent: string
  filename: string
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
    highlight: {
      highlighter,
    },
    remarkPlugins: [liveCode, admonitions],
  }) || { code: '', data: {} }
  cache.set(cacheKey, transformedSvelteCode)

  return transformedSvelteCode
}
