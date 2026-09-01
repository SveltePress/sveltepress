import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'
import { locales } from './config/locales.ts'
import navbar from './config/navbar.ts'
import pwa from './config/pwa.ts'
import sidebar from './config/sidebar.ts'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        navbar,
        sidebar,
        editLink: 'https://github.com/SveltePress/sveltepress/edit/main/packages/docs-site/src/routes/:route',
        github: 'https://github.com/SveltePress/sveltepress',
        logo: '/sveltepress.svg',
        discord: 'https://discord.gg/MeYRrGGxbE',
        ga: 'G-J2W78BKCHB',
        docsearch: {
          apiKey: 'fbed412316ec83ff28e9a916161bf715',
          appId: '4D30VFIAMG',
          indexName: 'sveltepress',
        },
        pwa,
        themeColor: {
          light: '#f2f2f2',
          dark: '#18181b',
        },
        preBuildIconifyIcons: {
          'vscode-icons': ['file-type-svelte', 'file-type-markdown', 'file-type-vite'],
          'logos': ['typescript-icon', 'svelte-kit', 'svelte-icon'],
          'emojione': ['artist-palette'],
          'material-symbols': ['history'],
          'ph': ['smiley', 'layout-duotone'],
          'noto': ['package'],
          'solar': ['chat-square-code-outline', 'reorder-outline'],
          'carbon': ['tree-view-alt', 'import-export'],
          'ic': ['sharp-rocket-launch'],
          'tabler': ['icons'],
          'mdi': ['theme-light-dark'],
          'bi': ['list-nested'],
          'openmoji': ['red-apple'],
        },
        highlighter: {
          twoslash: true,
          languages: ['svelte', 'sh', 'js', 'html', 'ts', 'md', 'css', 'scss', 'json', 'yaml'],
        },
      }),
      locales,
      siteConfig: {
        title: 'Sveltepress',
        description: 'A content centered site build tool',
      },
      addInspect: true,
      llms: {
        enabled: true,
        baseUrl: 'https://sveltepress.site',
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5556,
  },
})

export default config
