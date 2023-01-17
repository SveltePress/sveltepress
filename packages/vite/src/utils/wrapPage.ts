import LRUCache from 'lru-cache'
import type { MdsvexOptions } from 'mdsvex'
import type { ResolvedTheme, SiteConfig } from '../types'
import mdToSvelte from '../markdown/mdToSvelte.js'
import { parseSvelteFrontmatter } from './parseSvelteFrontmatter.js'
import { info } from './log.js'
import { getFileLastUpdateTime } from './getFileLastUpdate.js'

const cache = new LRUCache<string, any>({ max: 1024 })
const scriptRe = /<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/g
const styleRe = /<style\b[^>]*>[\s\S]*?<\/style\b[^>]*>/g

export async function wrapPage({ id, mdOrSvelteCode, theme, siteConfig }: {
  theme?: ResolvedTheme
  siteConfig: SiteConfig
  mdOrSvelteCode: string
  id: string
}) {
  const cacheKey = JSON.stringify({ id, mdOrSvelteCode })
  let cached = cache.get(cacheKey)
  if (cached)
    return cached

  const mdsvexOptions: MdsvexOptions = {
    highlight: {
      highlighter: theme?.highlighter,
    },
    remarkPlugins: theme?.remarkPlugins,
    rehypePlugins: theme?.rehypePlugins,
  }
  let fm: Record<string, any> = {}
  let svelteCode = ''

  // /src/routes/foo/+page.(md|svelte) => /foo/+page.(md|svelte)
  const relativeRouteFilePath = id.slice(id.indexOf('/src/routes/')).replace(/^\/src\/routes/, '')

  const routeId = relativeRouteFilePath.replace(/\+page.(md|svelte)$/, '')
  info('parsing: ', routeId)
  const lastUpdate = await getFileLastUpdateTime(id)

  if (id.endsWith('.md')) {
    const { code, data } = await mdToSvelte({
      mdContent: mdOrSvelteCode,
      filename: id,
      mdsvexOptions,
    }) || { code: '', data: {} }
    fm = {
      pageType: 'md',
      lastUpdate,
      ...data?.fm || {},
      anchors: data?.anchors || [],
    }
    svelteCode = code
  }
  if (id.endsWith('.svelte')) {
    fm = {
      ...parseSvelteFrontmatter(mdOrSvelteCode),
      pageType: 'svelte',
      lastUpdate,
    }
    svelteCode = mdOrSvelteCode
  }

  let wrappedCode = svelteCode
  if (theme?.pageLayout) {
    wrappedCode = wrapSvelteCode({
      svelteCode,
      fm,
      siteConfig,
      pageLayout: theme?.pageLayout,
    })
  }
  cached = {
    wrappedCode,
    fm,
    routeId,
  }
  cache.set(cacheKey, cached)
  return cached
}

export function wrapSvelteCode({
  pageLayout,
  svelteCode,
  siteConfig,
  fm,
}: {
  svelteCode: string
  pageLayout: string
  siteConfig: SiteConfig
  fm: Record<string, any>
}) {
  const imports = [
    `import PageLayout from '${pageLayout}'`,
    `const fm = ${JSON.stringify(fm)}`,
    `const siteConfig = ${JSON.stringify(siteConfig)}`,
  ].join('\n')
  const scripts = []
  let matches: RegExpMatchArray | null = null
  do {
    matches = scriptRe.exec(svelteCode)
    if (matches)
      scripts.push(matches[0])
  } while (matches)

  if (scripts.length) {
    scripts.forEach((s) => {
      svelteCode = svelteCode.replace(new RegExp(s), '')
    })
    scripts[0] = scripts[0].replace(/<script\b[^>]*>/, m => [
      m,
      imports,
    ].join('\n'))
  }
  const styleMatches = styleRe.exec(svelteCode)
  let styleCode = ''
  if (styleMatches) {
    styleCode = styleMatches[0]
    svelteCode = svelteCode.replace(new RegExp(styleCode), '')
  }
  return `
  ${scripts.join('\n')}
<PageLayout {fm} {siteConfig}>
  ${svelteCode}
</PageLayout>
${styleCode}
`
}
