import Search from './Search.svelte'

export default {
  navbar: [],
  sidebar: {},
  search: Search,
  i18n: {
    navbarMenu: '打开导航菜单',
    versionSelector: '文档版本',
    versionPageUnavailable: '所选版本没有此页面，已返回版本首页。',
    versionDeprecated: '此版本已弃用。',
    versionDeprecatedLabel: '已弃用',
    versionEol: '此版本已停止支持。',
    versionEolLabel: '停止支持',
    versionViewCurrent: '查看当前文档',
    versionSearchUnavailable: '此文档版本不提供搜索。',
    versionNewLabel: '新增于 {version}',
    versionChangesSelector: '查看版本变化',
    versionChangesNewPages: '新增页面',
    versionChangesUpdatedPages: '更新页面',
    versionChangesNoBaseline: '这是首个版本，没有可比较的历史基准。',
    versionChangesEmpty: '这个版本没有记录到变化。',
  },
}
