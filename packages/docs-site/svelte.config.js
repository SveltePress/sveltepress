import { vitePreprocess } from '@sveltejs/kit/vite'
import adapter from './adapter-wrapper/index.js'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter({
      pages: 'dist',
    }),
  },
}

export default config
