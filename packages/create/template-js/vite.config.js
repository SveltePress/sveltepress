import { defineConfig } from 'vite'
import { sveltepress } from '@svelte-press/vite'
import { defaultTheme } from '@svelte-press/theme-default'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme(),
      siteConfig: {
        title: 'Sveltepress Javascript',
        description: 'A content centered site build tool',
      },
    }),
  ],
})

export default config
