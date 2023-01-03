import { defineConfig } from 'vite'
import { sveltepress } from '@svelte-press/vite'

const config = defineConfig({
  plugins: [
    sveltepress({
      siteConfig: {
        title: 'Sveltepress Javascript',
        description: 'A content centered site build tool',
      },
    }),
  ],
})

export default config
