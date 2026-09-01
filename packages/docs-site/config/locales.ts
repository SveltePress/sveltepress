import type { LocalesConfig } from '@sveltepress/vite'
import bnI18n from './bn/i18n'
import bnNavbar from './bn/navbar'
import bnSidebar from './bn/sidebar'
import navbar from './navbar'
import sidebar from './sidebar'
import zhDocsearch from './zh/docsearch'
import zhI18n from './zh/i18n'
import zhNavbar from './zh/navbar'
import zhSidebar from './zh/sidebar'

const enEditLink = 'https://github.com/SveltePress/sveltepress/edit/main/packages/docs-site/src/routes/:route'
const zhEditLink = 'https://github.com/SveltePress/sveltepress/edit/main/packages/docs-site/src/routes/zh/:route'
const bnEditLink = 'https://github.com/SveltePress/sveltepress/edit/main/packages/docs-site/src/routes/bn/:route'

const enDocsearch = {
  apiKey: 'fbed412316ec83ff28e9a916161bf715',
  appId: '4D30VFIAMG',
  indexName: 'sveltepress',
}

/**
 * The merged documentation site's locales. Each locale carries its full
 * theme options; the theme resolves them per route via
 * `virtual:sveltepress/locale`.
 */
export const locales: LocalesConfig = {
  '/': {
    lang: 'en',
    label: 'English',
    theme: {
      navbar,
      sidebar,
      editLink: enEditLink,
      docsearch: enDocsearch,
    },
  },
  '/zh/': {
    lang: 'zh',
    label: '中文',
    theme: {
      navbar: zhNavbar,
      sidebar: zhSidebar,
      editLink: zhEditLink,
      docsearch: zhDocsearch,
      i18n: zhI18n,
    },
  },
  '/bn/': {
    lang: 'bn',
    label: 'বাংলা',
    theme: {
      navbar: bnNavbar,
      sidebar: bnSidebar,
      editLink: bnEditLink,
      i18n: bnI18n,
    },
  },
}
