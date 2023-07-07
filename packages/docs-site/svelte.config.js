import { vitePreprocess } from '@sveltejs/kit/vite'
import adapter from '@sveltejs/adapter-static'
import { SERVICE_WORKER_PATH } from '@sveltepress/theme-default'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter({
      pages: 'dist',
      fallback: '404.html',
    }),
    files: {
      serviceWorker: SERVICE_WORKER_PATH,
    },
    serviceWorker: {
      register: false,
    },
  },
  // onwarn: (warning, handler) => {
  //   if (warning.code.startsWith('a11y-')) {
  //     return;
  //   }
  //   handler(warning);
  // }
}

export default config
