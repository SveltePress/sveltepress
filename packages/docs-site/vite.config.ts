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
          title: 'Reference',
          to: '/reference/vite-plugin-options/',
        }],
        sidebar: {
          '/guide/': [
            {
              title: 'Introduction',
              items: [
                {
                  title: 'What is sveltepress',
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
            {
              title: 'Markdown features',
              items: [
                {
                  title: 'Frontmatter',
                  to: '/guide/markdown/frontmatter/',
                },
                {
                  title: 'Admonitions',
                  to: '/guide/markdown/admonitions/',
                },
                {
                  title: 'Code blocks',
                  to: '/guide/markdown/code-block/',
                },
                {
                  title: 'Svelte in markdown',
                  to: '/guide/markdown/svelte-in-markdown/',
                },
              ],
            },
          ],
          '/reference/': [{
            title: 'Reference',
            items: [
              {
                title: 'Vite plugin options',
                to: '/reference/vite-plugin-options/',
              }, {
                title: 'Default theme options',
                to: '/reference/default-theme-options/',
              },
            ],
          }],

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
