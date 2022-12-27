import { vitePreprocess } from '@sveltejs/kit/vite'

/**
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  preprocess: [vitePreprocess()],
  package: {
    source: 'src',
    dir: 'dist'
  }
}

export default config