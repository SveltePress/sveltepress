import { defineMDSveXConfig as defineConfig } from 'mdsvex'
import remarkAdmonitions from 'remark-admonitions'
import liveCode from './src/plugins/remark-live-code/index.js'
import highlighter from './src/plugins/remark-live-code/highlighter.js'

const config = defineConfig({
  extensions: ['.md'],
  highlight: {
    highlighter,
  },
  remarkPlugins: [liveCode, remarkAdmonitions],
  rehypePlugins: [],
})

export default config
