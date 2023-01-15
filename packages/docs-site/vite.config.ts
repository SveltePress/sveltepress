import { defineConfig } from 'vite'
import { sveltepress } from '@svelte-press/vite'
import { defaultTheme } from '@svelte-press/theme-default'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        navbar: [{
          title: 'Guide',
          to: '/guide/introduction/',
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
              title: 'Introduction',
              to: '/guide/introduction/',
            },
            {
              title: 'Quick start',
              to: '/guide/quick-start/',
            },
            {
              title: 'Themes',
              to: '/guide/themes/',
            },
          ],
        },
        editLink: 'https://github.com/Blackman99/sveltepress/edit/main/packages/docs-site/src/routes/:route',
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
