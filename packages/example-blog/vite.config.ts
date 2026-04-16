import { blogTheme } from '@sveltepress/theme-blog'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: blogTheme({
        title: 'Example Blog',
        description: 'A demo blog powered by @sveltepress/theme-blog',
        base: 'http://localhost:4173',
        author: 'Demo Author',
        navbar: [
          { title: 'Home', to: '/' },
          { title: 'Tags', to: '/tags/svelte' },
        ],
        rss: {
          enabled: true,
          limit: 20,
          copyright: `© ${new Date().getFullYear()} Example Blog`,
        },
      }),
      siteConfig: {
        title: 'Example Blog',
        description: 'A demo blog powered by @sveltepress/theme-blog',
      },
    }),
  ],
  server: {
    port: 5560,
  },
})

export default config
