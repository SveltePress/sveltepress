import { LRUCache } from 'lru-cache'
import type { ResolvedTheme } from '../types'
import mdToSvelte from '../markdown/md-to-svelte.js'
import { parseSvelteFrontmatter } from './parse-svelte-frontmatter.js'
import { getFileLastUpdateTime } from './get-file-last-update.js'

const cache = new LRUCache<string, any>({ max: 100 })
export const scriptRe = /<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/g
const styleRe = /<style\b[^>]*>[\s\S]*?<\/style\b[^>]*>/g
const svelteHeadRe = /<svelte:head>[\s\S]*?<\/svelte:head>/g
const svelteBodyRe = /(<svelte:body\b[^>]*>[\s\S]*?<\/svelte:body>)/g
const svelteWindowRe = /(<svelte:window\b[^>]*>[\s\S]*?<\/svelte:window>)|(<window\b[^>]*\/>)/g

export async function wrapPage({
  layout,
  id,
  mdOrSvelteCode,
  highlighter,
  rehypePlugins,
  remarkPlugins,
  footnoteLabel,
}: {
  mdOrSvelteCode: string
  id: string
  layout?: string
} & Partial<Omit<ResolvedTheme, 'name' | 'vitePlugins' | 'pageLayout' | 'globalLayout'>>) {
  const cacheKey = JSON.stringify({ id, mdOrSvelteCode })
  let cached = cache.get(cacheKey)
  if (cached)
    return cached

  let fm: Record<string, any> = {}
  let svelteCode = ''

  const lastUpdate = await getFileLastUpdateTime(id)

  if (id.endsWith('.md')) {
    const { code, data } = await mdToSvelte({
      mdContent: mdOrSvelteCode,
      highlighter,
      remarkPlugins,
      rehypePlugins,
      filename: id,
      footnoteLabel,
    }) || { code: '', data: {} }
    const { fm: dataFm = {}, ...others } = data || { fm: {} }
    fm = {
      pageType: 'md',
      lastUpdate,
      ...(dataFm as any),
      ...others,
    }
    svelteCode = code
  }
  else if (id.endsWith('page.svelte')) {
    fm = {
      ...(await parseSvelteFrontmatter(mdOrSvelteCode)),
      pageType: 'svelte',
      lastUpdate,
    }
    svelteCode = mdOrSvelteCode
  }
  else if (id.endsWith('layout.svelte')) {
    svelteCode = mdOrSvelteCode
  }

  let wrappedCode = svelteCode
  if (layout) {
    wrappedCode = wrapSvelteCode({
      svelteCode,
      fm,
      pageLayout: layout,
    })
  }
  cached = {
    wrappedCode,
    fm,
  }
  cache.set(cacheKey, cached)
  return cached
}

export function wrapSvelteCode({
  pageLayout,
  svelteCode,
  fm,
}: {
  svelteCode: string
  pageLayout: string
  fm: Record<string, any>
}) {
  const imports = [
    `import PageLayout from '${pageLayout}'`,
    `const fm = ${JSON.stringify(fm)}`,
  ].join('\n')

  const svelteTagReArr = [svelteHeadRe, svelteBodyRe, svelteWindowRe]
  const svelteBuiltinTags = svelteTagReArr.reduce<string[]>((res, re) => {
    const tags = hoistTag(re, svelteCode)
    svelteCode = svelteCode.replace(re, '')
    return [
      ...res,
      ...tags,
    ]
  }, [])

  const scripts = hoistTag(scriptRe, svelteCode)
  if (scripts.length) {
    scripts[0] = scripts[0].replace(/<script\b[^>]*>/, m => [
      m,
      imports,
    ].join('\n'))
  }
  else {
    scripts.push('<script>', imports, '</script>')
  }

  const styleMatches = styleRe.exec(svelteCode)
  let styleCode = ''
  if (styleMatches) {
    styleCode = styleMatches[0]
    svelteCode = svelteCode.replace(styleRe, '')
  }

  svelteCode = svelteCode.replace(scriptRe, '')
  return `${scripts.join('\n')}
${svelteBuiltinTags.join('\n')}
<PageLayout {fm}>${svelteCode}</PageLayout>
${styleCode}
`
}

function hoistTag(tagRe: RegExp, svelteCode: string) {
  const tags = []
  let matches: RegExpMatchArray | null = null
  do {
    matches = tagRe.exec(svelteCode)
    if (matches)
      tags.push(matches[0])
  } while (matches)
  return tags
}
