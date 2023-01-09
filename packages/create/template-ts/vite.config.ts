import { defineConfig } from 'vite'
import { sveltepress } from '@svelte-press/vite'
import { defaultTheme } from '@svelte-press/theme-default'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        navbar: [{
          title: 'Guide',
          items: [
            {
              title: 'Quick start',
              to: '/guide/quick-start',
            },
          ],
        }, {
          title: 'Markdown features',
          items: [
            {
              title: 'Live code',
              to: '/live-codes',
            },
            {
              title: 'Admonitions',
              to: '/admonitions',
            },
          ],
        }],
        github: 'https://github.com/Blackman99/sveltepress',
        logo: '/sveltepress.svg',
      }),
      siteConfig: {
        title: 'Sveltepress',
        description: 'A content centered site build tool',
      },
    }),
  ],
})

export default config
