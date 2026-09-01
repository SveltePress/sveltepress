import type { LocalesConfig } from '@sveltepress/vite'
import bnI18n from './bn/i18n.ts'
import bnNavbar from './bn/navbar.ts'
import bnSidebar from './bn/sidebar.ts'
import navbar from './navbar.ts'
import sidebar from './sidebar.ts'
import zhDocsearch from './zh/docsearch.ts'
import zhI18n from './zh/i18n.ts'
import zhNavbar from './zh/navbar.ts'
import zhSidebar from './zh/sidebar.ts'

/**
 * The shared root edit-link template for every locale. `page.route.id` already
 * carries the locale prefix (`/zh/...`, `/bn/...`), so prefixing the template
 * per locale would duplicate the segment (`/zh/zh/...`). One template keeps
 * all three locales pointing at their real merged-site source paths.
 */
const editLink = 'https://github.com/SveltePress/sveltepress/edit/main/packages/docs-site/src/routes/:route'

const enDocsearch = {
  apiKey: 'fbed412316ec83ff28e9a916161bf715',
  appId: '4D30VFIAMG',
  indexName: 'sveltepress',
}

const bnDocsearch = {
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
      editLink,
      docsearch: enDocsearch,
    },
  },
  '/zh/': {
    lang: 'zh',
    label: '中文',
    theme: {
      navbar: zhNavbar,
      sidebar: zhSidebar,
      editLink,
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
      editLink,
      docsearch: bnDocsearch,
      i18n: bnI18n,
    },
  },
}
