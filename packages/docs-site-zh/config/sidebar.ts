export default {
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
          title: '写作基础',
          to: '/guide/markdown/basic-writing/',
        },
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
          title: 'Twoslash',
          to: '/guide/default-theme/twoslash/',
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
}
