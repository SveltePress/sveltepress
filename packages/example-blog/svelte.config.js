import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte'],
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist',
      fallback: '404.html',
    }),
    prerender: {
      handleMissingId: 'ignore',
      handleUnseenRoutes: 'ignore',
    },
    paths: {
      relative: false,
    },
  },
  compilerOptions: {
    runes: true,
  },
}

export default config
