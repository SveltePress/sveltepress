import { compile } from 'mdsvex'
// @ts-ignore
import admonitions from 'remark-admonitions'
import liveCode from '@svelte-press/remark-live-code'
import highlighter from './highlighter.js'
import type { SveltepressPreprocessor } from './types'

const sveltepressPreprocessor: SveltepressPreprocessor = ({ mdsvexOptions }) => {
  return {
    markup: async ({ content, filename }) => {
      const transformedSvlteCode = await compile(content, {
        extensions: ['.md'],
        filename,
        ...mdsvexOptions,
        highlight: {
          highlighter,
        },
        remarkPlugins: [liveCode, admonitions],
      })

      return transformedSvlteCode
    },
  }
}

export default sveltepressPreprocessor
