import { resolve } from 'path'
import { writeFileSync } from 'fs'
// import LRUCache from 'lru-cache'
import fsExtra from 'fs-extra'
import type { SiteConfig } from './types'
import { BASE_PATH } from './plugin.js'

// TODO: use cache to avoid frequently IO
// const cache = new LRUCache<string, any>({ max: 1024 })

export function wrapPage({ id, svelteCode, pageLayout, fm = {}, siteConfig }: {
  pageLayout?: string
  fm?: Record<string, any>
  siteConfig: SiteConfig
  svelteCode: string
  id: string
}) {
  if (!pageLayout)
    return svelteCode

  const wrap = (sveltePagePath: string) => `<script>
    import Page from '${sveltePagePath}'
    import PageLayout from \'${pageLayout}\'
  
    const fm = ${JSON.stringify(fm)}
    const siteConfig = ${JSON.stringify(siteConfig)}
  </script>
  <PageLayout {fm} {siteConfig}>
    <Page />
  </PageLayout>
    `
  // src/routes/foo/+page.(md|svelte) => // .sveltepress/pages/foo/_page.svelte
  let routeId = id.slice(id.indexOf('/src/routes/')).replace(/^\/src\/routes/, '')

  if (id.endsWith('.md'))
    routeId = id.slice(id.indexOf('/src/routes/')).replace(/^\/src\/routes/, '').replace(/\+page.md$/, '_page.svelte')

  const fullPagePath = resolve(BASE_PATH, `pages${routeId}`)
  fsExtra.ensureFileSync(fullPagePath)
  writeFileSync(fullPagePath, svelteCode)
  return wrap(fullPagePath)
  return svelteCode
}

