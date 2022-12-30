import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/kit/vite'
import sveltepressPreprocessor from '@svelte-press/svelte-preprocessor'

/**
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [vitePreprocess(), sveltepressPreprocessor({})],
  kit: {
    adapter: adapter({
      pages: 'dist',
    }),
  },
}

export default config
