import { compile } from 'mdsvex'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import admonitions from 'remark-admonitions'
import type { MdsvexOptions } from 'mdsvex'
import LRUCache from 'lru-cache'
import type { Frontmatter, SiteConfig } from '../types.js'
import liveCode from './live-code.js'
import highlighter from './highlighter.js'
const cache = new LRUCache<string, any>({ max: 1024 })

export default async ({ mdContent, filename, mdsvexOptions, siteConfig }: {
  mdContent: string
  filename: string
  mdsvexOptions?: MdsvexOptions
  siteConfig: Required<SiteConfig>
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

  const { data } = transformedSvelteCode
  const { fm } = data as { fm: Frontmatter }
  const { title, description } = fm
  transformedSvelteCode.code = `<svelte:head>
    <title>${title ? `${title} - ${siteConfig.title}` : siteConfig.title}</title>
    <meta name="description" content="${description || siteConfig.description}">
</svelte:head>
${transformedSvelteCode.code}`

  return transformedSvelteCode
}
