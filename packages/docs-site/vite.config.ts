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
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23Z"/></svg>',
          to: 'https://twitter.com/',
        },
        {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23Z"/></svg>',
          to: 'https://twitter.com/',
        },
        ],
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
                  title: 'Home page',
                  to: '/guide/default-theme/home-page/',
                },
                {
                  title: 'Built-in Components',
                  to: '/guide/default-theme/builtin-components/',
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
                  title: 'PWA',
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
          kit: {
            trailingSlash: 'always',
          },
          darkManifest: '/manifest-dark.webmanifest',
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
              },
              {
                src: '/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
              },
            ],
            theme_color: '#f2f2f2',
            background_color: '#f2f2f2',
            display: 'standalone',
          },
          injectManifest: {
            globDirectory: '.svelte-kit/output',
            globPatterns: [
              'client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}',
              '../../.sveltepress/prerendered/**/*.html',
            ],
          },
        },
        themeColor: {
          light: '#f2f2f2',
          dark: '#18181b',
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
