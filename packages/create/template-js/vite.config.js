import { defineConfig } from 'vite'
import VitePlugSveltepress from '@svelte-press/vite'

const config = defineConfig({
  plugins: [
    VitePlugSveltepress({
      siteConfig: {
        title: 'Sveltepress',
        description: 'Built with Sveltepress',
      },
    }),
  ],
})

export default config
