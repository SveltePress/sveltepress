import { resolve } from 'path'
import { writeFileSync } from 'fs'
import LRUCache from 'lru-cache'
import fsExtra from 'fs-extra'
import type { MdsvexOptions } from 'mdsvex'
import type { ResolvedTheme, SiteConfig } from '../types'
import { BASE_PATH } from '../plugin.js'
import mdToSvelte from '../markdown/mdToSvelte.js'
import { parseSvelteFrontmatter } from './parseSvelteFrontmatter.js'
import { info } from './log.js'

const cache = new LRUCache<string, any>({ max: 1024 })

export async function wrapPage({ id, mdOrSvelteCode, theme, siteConfig }: {
  theme?: ResolvedTheme
  siteConfig: SiteConfig
  mdOrSvelteCode: string
  id: string
}) {
  if (!theme?.pageLayout)
    return mdOrSvelteCode

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

  if (id.endsWith('.md')) {
    const { code, data } = await mdToSvelte({
      mdContent: mdOrSvelteCode,
      filename: id,
      mdsvexOptions,
    }) || { code: '', data: {} }
    fm = data?.fm || {}
    svelteCode = code
  }
  if (id.endsWith('.svelte')) {
    fm = parseSvelteFrontmatter(mdOrSvelteCode)
    svelteCode = mdOrSvelteCode
  }

  const wrap = (sveltePagePath: string) => `<script>
    import Page from '${sveltePagePath}'
    import PageLayout from \'${theme.pageLayout}\'
  
    const fm = ${JSON.stringify(fm)}
    const siteConfig = ${JSON.stringify(siteConfig)}
  </script>
  <PageLayout {fm} {siteConfig}>
    <Page />
  </PageLayout>
  `

  // src/routes/foo/+page.(md|svelte) => .sveltepress/pages/foo/_page.svelte
  // NOTICE: cannot use +page as filename cause it would case circular parse
  const routePath = relativeRouteFilePath.replace(/\+page.(md|svelte)$/, '_page.svelte')

  const fullPagePath = resolve(BASE_PATH, `pages${routePath}`)
  fsExtra.ensureFileSync(fullPagePath)
  writeFileSync(fullPagePath, svelteCode)
  const wrappedCode = wrap(fullPagePath)
  cached = {
    wrappedCode,
    fm,
    routeId,
  }
  cache.set(cacheKey, cached)
  return cached
}

