import { readFileSync } from 'fs'
import { resolve } from 'path'
import fg from 'fast-glob'
import type { ResolvedTheme, SiteConfig } from '../types'
import { wrapPage } from './wrapPage.js'

export async function getPages(siteConfig: SiteConfig, theme?: ResolvedTheme) {
  const fgPages = (await fg('src/routes/**/+page.(md|svelte)'))
  const pages: Array<{
    to: string
    fm: Record<string, any>
  }> = []
  for (const path of fgPages) {
    const id = resolve(process.cwd(), path)
    const { routeId, fm } = await wrapPage({
      mdOrSvelteCode: readFileSync(path, 'utf-8'),
      theme,
      id,
      siteConfig,
    })
    pages.push({
      to: routeId,
      fm,
    })
  }
  return pages.sort((s1, s2) => s1.fm.title.charCodeAt(0) - s2.fm.title.charCodeAt(0))
}
