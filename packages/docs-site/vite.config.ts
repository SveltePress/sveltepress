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
              to: '/guide/quick-start/',
            },
          ],
        }, {
          title: 'Features',
          items: [
            {
              title: 'Code block',
              to: '/features/code-block/',
            },
            {
              title: 'Admonitions',
              to: '/features/admonitions/',
            },
          ],
        }],
        sidebar: {
          '/features/': [{
            title: 'Code Blocks',
            to: '/features/code-block/',
          }, {
            title: 'Admonitions',
            to: '/features/admonitions/',
          }],
          '/guide/': [
            {
              title: 'Quick start',
              to: '/guide/quick-start/',
            },
          ],
        },
        github: 'https://github.com/Blackman99/sveltepress',
        logo: '/sveltepress.svg',
      }),
      siteConfig: {
        title: 'Sveltepress',
        description: 'A content centered site build tool',
      },
      addInspect: true,
    }),
  ],
})

export default config
