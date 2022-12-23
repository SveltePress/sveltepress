import { readFileSync } from 'fs'
import { resolve } from 'path'
import { compile } from 'mdsvex'
import type { Plugin } from 'vite'
import { getHighlighter } from 'shiki'
import remarkAdmonitions from 'remark-admonitions'
import liveCode from '../remark/live-code'
import nightOwl from './night-owl.json'
import type { PluginOptions } from './types'

const shikiHilighter = getHighlighter({
  theme: nightOwl as any,
})

const vitePluginMdsvex: (options?: PluginOptions) => Plugin = (options = {}) => {
  const { mdsvexOptions } = options
  const fileRegex = /\.md$/

  const virtualModuleId = 'mdsvex.css'
  const resolvedVirtualModuleId = '\0mdsvex.css'

  return {
    name: 'vite-plugin-mdsvex',
    enforce: 'pre',
    async transform(src, id) {
      if (fileRegex.test(id)) {
        const highlighter = async (code: any, lang: any) => {
          const shikiTransformedHTML = (await shikiHilighter).codeToHtml(code, { lang })

          return `
  <div contenteditable="true">
    ${shikiTransformedHTML.replaceAll(/\{/g, '&#123;').replaceAll(/\}/g, '&#125;')}
  </div>`
        }

        const { code, map } = await compile(src, {
          highlight: {
            highlighter,
          },
          remarkPlugins: [liveCode, remarkAdmonitions],
          ...mdsvexOptions,
        }) ?? { code: src }

        return {
          code,
          map,
        }
      }
    },
    resolveId(id) {
      if (id === virtualModuleId)
        return resolvedVirtualModuleId
    },
    load(id) {
      if (id === resolvedVirtualModuleId)
        return readFileSync(resolve(__dirname, 'main.css'), 'utf-8')
    },
  }
}

export default vitePluginMdsvex

