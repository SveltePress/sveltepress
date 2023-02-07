import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

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
              collapsible: true,
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
                {
                  title: 'Working with Typescript',
                  to: '/guide/typescript/',
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
              collapsible: true,
              items: [
                {
                  title: 'Frontmatter',
                  to: '/guide/default-theme/frontmatter/',
                },
                {
                  title: 'Navbar',
                  to: '/guide/default-theme/navbar/',
                },
                {
                  title: 'Sidebar',
                  to: '/guide/default-theme/sidebar/',
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
                  title: 'Code related',
                  to: '/guide/default-theme/code-related/',
                },
                {
                  title: 'Unocss',
                  to: '/guide/default-theme/unocss/',
                },
                {
                  title: 'Docsearch',
                  to: '/guide/default-theme/docsearch/',
                },
                {
                  title: 'Pwa',
                  to: '/guide/default-theme/pwa/',
                },
                {
                  title: 'Google Analytics',
                  to: '/guide/default-theme/google-analytics/',
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
        discord: 'https://discord.gg/MeYRrGGxbE',
        ga: 'G-J2W78BKCHB',
        docsearch: {
          apiKey: 'fbed412316ec83ff28e9a916161bf715',
          appId: '4D30VFIAMG',
          indexName: 'sveltepress',
        },
        pwa: {
          scope: '/',
          base: '/',
          strategies: 'injectManifest',
          manifest: {
            start_url: '/',
            scope: '/',
            name: 'Sveltepress',
            short_name: 'Sveltepress',
            icons: [
              {
                src: '/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable',
              },
              {
                src: '/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
              },
            ],
            theme_color: '#fb7185',
            background_color: '#ffffff',
            display: 'standalone',
          },
          injectManifest: {
            globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
          },
        },
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
