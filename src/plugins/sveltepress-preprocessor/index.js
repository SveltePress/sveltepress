import { compile } from 'mdsvex'
import admonitions from 'remark-admonitions'
import highlighter from '../remark-live-code/highlighter.js'
import liveCode from '../remark-live-code/index.js'

/**
 * @type {import('./type').SveltepressPreprocessor}
 */
const sveltepressPreprocessor = ({ mdsvexOptions }) => {
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
