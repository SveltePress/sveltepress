import Search from './Search.svelte'

export default {
  navbar: [],
  sidebar: {},
  search: Search,
  i18n: {
    versionSelector: '文档版本',
    versionPageUnavailable: '所选版本没有此页面，已返回版本首页。',
    versionDeprecated: '此版本已弃用。',
    versionDeprecatedLabel: '已弃用',
    versionEol: '此版本已停止支持。',
    versionEolLabel: '停止支持',
    versionViewCurrent: '查看当前文档',
    versionSearchUnavailable: '此文档版本不提供搜索。',
  },
}
