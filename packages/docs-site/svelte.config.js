import { vitePreprocess } from '@sveltejs/kit/vite'
import adapter from '@sveltejs/adapter-vercel'
import { SERVICE_WORKER_PATH } from '@sveltepress/theme-default'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    files: {
      serviceWorker: SERVICE_WORKER_PATH,
    },
  },
}

export default config
