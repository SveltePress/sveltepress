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
          to: '/reference/vite-plugin/',
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
                  title: 'Svelte in markdown',
                  to: '/guide/markdown/svelte-in-markdown/',
                },
              ],
            },
            {
              title: 'Default theme features',
              items: [
                {
                  title: 'Frontmatter',
                  to: '/guide/default-theme/frontmatter/',
                },
                {
                  title: 'Links',
                  to: '/guide/default-theme/links/',
                },
                {
                  title: 'Headings & Anchors',
                  to: '/guide/default-theme/headings-and-anchors/',
                },
                {
                  title: 'Admonitions',
                  to: '/guide/default-theme/admonitions/',
                },
                {
                  title: 'Code relative',
                  to: '/guide/default-theme/code-relative/',
                },
              ],
            },
          ],
          '/reference/': [{
            title: 'Reference',
            items: [
              {
                title: 'Vite plugin',
                to: '/reference/vite-plugin/',
              }, {
                title: 'Default theme',
                to: '/reference/default-theme/',
              },
            ],
          }],

        },
        editLink: 'https://github.com/Blackman99/sveltepress/edit/main/packages/docs-site/src/routes/:route',
        github: 'https://github.com/Blackman99/sveltepress',
        logo: '/sveltepress.svg',
        discord: 'https://discord.com/channels/994160573333913691/1065131029616136273',
      }),
      siteConfig: {
        title: 'Sveltepress',
        description: 'A content centered site build tool. Build on top of SvelteKit',
      },
      addInspect: true,
    }),
  ],
})

export default config
