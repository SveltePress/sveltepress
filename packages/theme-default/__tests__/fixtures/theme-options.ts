import Search from './Search.svelte'

export default {
  navbar: [],
  sidebar: {
    '/guide/': [{
      title: 'Guide',
      items: [
        { title: 'Guide', to: '/guide/' },
        { title: 'New guide', to: '/guide/new/' },
        { title: 'Unchanged', to: '/guide/unchanged/' },
      ],
    }],
  },
  search: Search,
  i18n: {
    navbarMenu: '打开导航菜单',
    versionSelector: '文档版本',
    versionPageUnavailable: '所选版本没有此页面，已返回版本首页。',
    versionDeprecated: '当前访问的是旧版站点，无法保证所有功能可用性，请切换至',
    versionDeprecatedLabel: '已弃用',
    versionEol: '当前访问的是旧版站点，无法保证所有功能可用性，请切换至',
    versionEolLabel: '停止支持',
    versionViewCurrent: '新版本',
    versionSearchUnavailable: '此文档版本不提供搜索。',
    versionNewLabel: '新增于 {version}',
    versionNavigationNewLabel: '新',
    versionChangesSelector: '查看版本变化',
    versionChangesNewPages: '新增页面',
    versionChangesUpdatedPages: '更新页面',
    versionChangesNoBaseline: '这是首个版本，没有可比较的历史基准。',
    versionChangesEmpty: '这个版本没有记录到变化。',
  },
}
