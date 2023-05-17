import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

const config = defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        navbar: [{
          title: '指南',
          to: '/guide/introduction/',
        }, {
          title: '参考',
          to: '/reference/vite-plugin/',
        }, {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M27.85 29H30l-6-15h-2.35l-6 15h2.15l1.6-4h6.85zm-7.65-6l2.62-6.56L25.45 23zM18 7V5h-7V2H9v3H2v2h10.74a14.71 14.71 0 0 1-3.19 6.18A13.5 13.5 0 0 1 7.26 9h-2.1a16.47 16.47 0 0 0 3 5.58A16.84 16.84 0 0 1 3 18l.75 1.86A18.47 18.47 0 0 0 9.53 16a16.92 16.92 0 0 0 5.76 3.84L16 18a14.48 14.48 0 0 1-5.12-3.37A17.64 17.64 0 0 0 14.8 7z"/></svg>',
          items: [
            {
              title: 'English',
              to: 'https://sveltepress.site/',
              external: true,
            },
          ],
        },
        ],
        sidebar: {
          '/guide/': [
            {
              title: '介绍',
              collapsible: true,
              items: [
                {
                  title: 'Sveltepress 是什么',
                  to: '/guide/introduction/',
                },
                {
                  title: '快速开始',
                  to: '/guide/quick-start/',
                },
                {
                  title: '主题',
                  to: '/guide/themes/',
                },
                {
                  title: '与 Typescript 一起开发',
                  to: '/guide/typescript/',
                },
              ],
            },
            {
              title: 'Markdown 相关',
              items: [
                {
                  title: 'Frontmatter',
                  to: '/guide/markdown/frontmatter/',
                },
                {
                  title: '在 Markdown 中使用 Svelte',
                  to: '/guide/markdown/svelte-in-markdown/',
                },
              ],
            },
            {
              title: '默认主题特性',
              collapsible: true,
              items: [
                {
                  title: 'Frontmatter',
                  to: '/guide/default-theme/frontmatter/',
                },
                {
                  title: '导航栏',
                  to: '/guide/default-theme/navbar/',
                },
                {
                  title: '侧边栏',
                  to: '/guide/default-theme/sidebar/',
                },
                {
                  title: '主页',
                  to: '/guide/default-theme/home-page/',
                },
                {
                  title: '内置组件',
                  to: '/guide/default-theme/builtin-components/',
                },
                {
                  title: '标题与页内导航',
                  to: '/guide/default-theme/headings-and-anchors/',
                },
                {
                  title: '高亮块',
                  to: '/guide/default-theme/admonitions/',
                },
                {
                  title: '代码相关',
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
            title: '参考',
            items: [
              {
                title: 'Vite 插件',
                to: '/reference/vite-plugin/',
              }, {
                title: '默认主题',
                to: '/reference/default-theme/',
              },
            ],
          }],
        },
        editLink: 'https://github.com/Blackman99/sveltepress/edit/main/packages/docs-site/src/routes/:route',
        github: 'https://github.com/Blackman99/sveltepress',
        logo: '/sveltepress.svg',
        discord: 'https://discord.gg/MeYRrGGxbE',
        ga: 'G-BXGYGNH1V7',
        docsearch: {
          apiKey: '1c6fd2e6532da778b7eb108990545866',
          appId: 'D6826K4656',
          indexName: 'cn',
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
            name: 'Sveltepress zh-CN',
            short_name: 'Sveltepress zh-CN',
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
        i18n: {
          suggestChangesToThisPage: '在 Github 上编辑此页',
          lastUpdateAt: '最后更新于：',
          previousPage: '上一页',
          nextPage: '下一页',
          expansionTitle: '点击展开/折叠代码',
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
