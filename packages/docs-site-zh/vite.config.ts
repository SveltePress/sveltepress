import { defaultTheme } from '@sveltepress/theme-default'
import { sveltepress } from '@sveltepress/vite'
import { defineConfig } from 'vite'
import docsearch from './config/docsearch.ts'
import i18n from './config/i18n.ts'
import navbar from './config/navbar.ts'
import pwa from './config/pwa.ts'
import sidebar from './config/sidebar.ts'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        navbar,
        sidebar,
        editLink: 'https://github.com/SveltePress/sveltepress/edit/main/packages/docs-site-zh/src/routes/:route',
        github: 'https://github.com/SveltePress/sveltepress',
        logo: '/sveltepress.svg',
        discord: 'https://discord.gg/MeYRrGGxbE',
        ga: 'G-J2W78BKCHB',
        docsearch,
        pwa,
        themeColor: {
          light: '#f2f2f2',
          dark: '#18181b',
        },
        i18n,
        preBuildIconifyIcons: {
          'vscode-icons': ['file-type-svelte', 'file-type-markdown', 'file-type-vite'],
          'logos': ['typescript-icon', 'svelte-kit'],
          'emojione': ['artist-palette'],
          'openmoji': ['red-apple'],
          'ph': ['smiley', 'layout-duotone'],
          'noto': ['package'],
          'solar': ['chat-square-code-outline', 'reorder-outline'],
          'carbon': ['tree-view-alt', 'import-export'],
          'ic': ['sharp-rocket-launch'],
          'tabler': ['icons'],
          'mdi': ['theme-light-dark'],
        },
        highlighter: {
          twoslash: true,
        },
      }),
      siteConfig: {
        title: 'Sveltepress',
        description: '一个以内容为中心的站点构建工具',
      },
      addInspect: true,
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5554,
  },
})

export default config
