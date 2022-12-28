import { compile } from 'mdsvex'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import admonitions from 'remark-admonitions'
import liveCode from '@svelte-press/remark-live-code'
import highlighter from './highlighter.js'
import type { SveltepressPreprocessor } from './types'

const sveltepressPreprocessor: SveltepressPreprocessor = ({ mdsvexOptions }) => {
  return {
    markup: async ({ content, filename }) => {
      const transformedSvelteCode = await compile(content, {
        extensions: ['.md'],
        filename,
        ...mdsvexOptions,
        highlight: {
          highlighter,
        },
        remarkPlugins: [liveCode, admonitions],
      })

      return transformedSvelteCode
    },
  }
}

export default sveltepressPreprocessor
