import { mdsvex } from 'mdsvex'
import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/kit/vite'
import mdsvexConfig from './mdsvex.config.js'

const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],

  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],

  kit: {
    adapter: adapter(),
  },
}

export default config
