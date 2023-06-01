import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'
import sidebar from './config/sidebar'
import docsearch from './config/docsearch'
import pwa from './config/pwa'
import navbar from './config/navbar'
import i18n from './config/i18n'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        navbar,
        sidebar,
        editLink: 'https://github.com/Blackman99/sveltepress/edit/main/packages/docs-site/src/routes/:route',
        github: 'https://github.com/Blackman99/sveltepress',
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
          'vscode-icons': ['file-type-svelte', 'file-type-markdown'],
          'logos': ['typescript-icon', 'svelte-kit'],
          'emojione': ['artist-palette'],
        },
      }),
      siteConfig: {
        title: 'Sveltepress',
        description: '一个以内容为中心的站点构建工具',
      },
      addInspect: true,
    }),
  ],
})

export default config
