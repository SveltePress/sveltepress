import type { LocalesConfig, ResolvedLocale } from '@sveltepress/vite'
import {
  resolveLocale as resolveLocaleHelper,
  resolveLocaleSwitch as resolveLocaleSwitchHelper,
  resolveLocalizedPath as resolveLocalizedPathHelper,
} from '@sveltepress/vite/locale'
import themeOptions from './theme-options'
import { manifests as versionManifests } from './versions'

/**
 * Locales are null by default so every pre-existing theme test keeps the
 * single-locale behavior. Tests that exercise the language switcher install a
 * fixture via `setLocaleFixtures`.
 */
// eslint-disable-next-line import/no-mutable-exports -- test seam: components read this live binding
export let locales: LocalesConfig | null = null

export function setLocaleFixtures(value: LocalesConfig | null) {
  locales = value
}

export const resolveLocale = (pathname: string, base?: string) => resolveLocaleHelper(pathname, locales, base)
export const resolveLocalizedPath = (to: string, locale: ResolvedLocale | null, base?: string) => resolveLocalizedPathHelper(to, locale, locales, base)
export function resolveLocaleSwitch(pathname: string, targetPrefix: string, base?: string) {
  return resolveLocaleSwitchHelper(
    pathname,
    targetPrefix,
    locales,
    base,
    Object.fromEntries(Object.entries(versionManifests).map(([prefix, manifest]) => [
      prefix,
      {
        basePath: manifest.basePath,
        current: { id: manifest.current.id, routes: manifest.current.routes },
        versions: manifest.versions.map(version => ({ id: version.id, routes: version.routes })),
      },
    ])),
  )
}

const prefixedGuideRoutes = ['/', '/guide/', '/guide/install/', '/guide/new/', '/guide/unchanged/', '/guide/i18n/']

function prefixedLocale(
  lang: string,
  label: string,
  titles: { group: string, guide: string, next: string, unchanged: string, localeSwitcher: string },
): LocalesConfig[string] {
  return {
    lang,
    label,
    theme: {
      ...themeOptions,
      navbar: [{ title: titles.guide, to: '/guide/' }],
      sidebar: {
        '/guide/': [{
          title: titles.group,
          items: [
            { title: titles.guide, to: '/guide/' },
            { title: titles.next, to: '/guide/new/' },
            { title: titles.unchanged, to: '/guide/unchanged/' },
          ],
        }],
      },
      i18n: {
        ...themeOptions.i18n,
        localeSwitcher: titles.localeSwitcher,
      },
    },
    routes: prefixedGuideRoutes,
  }
}

/** A multi-locale site fixture. Adding a prefix here is enough for theme tests to cover it. */
export function localeFixture(): LocalesConfig {
  return {
    '/': {
      lang: 'en',
      label: 'English',
      theme: { ...themeOptions },
      routes: ['/', '/guide/', '/guide/install/', '/reference/new-api/'],
    },
    '/zh/': (() => {
      const locale = prefixedLocale('zh', '中文', {
        group: '指南',
        guide: '指南',
        next: '新指南',
        unchanged: '未变',
        localeSwitcher: '切换语言',
      })
      return {
        ...locale,
        theme: {
          ...locale.theme,
          i18n: {
            ...themeOptions.i18n,
            searchPlaceholder: '搜索文档...',
            searchNoResults: '未找到 "{query}" 的相关结果',
            searchDevNotice: '本地搜索索引在生产构建后生成。',
            localeSwitcher: '切换语言',
            localePageUnavailable: '此页面没有中文版本，已返回中文首页。',
          },
        },
      }
    })(),
    '/bn/': prefixedLocale('bn', 'বাংলা', {
      group: 'গাইড',
      guide: 'গাইড',
      next: 'নতুন গাইড',
      unchanged: 'অপরিবর্তিত',
      localeSwitcher: 'ভাষা',
    }),
    '/ja/': prefixedLocale('ja', '日本語', {
      group: 'ガイド',
      guide: 'ガイド',
      next: '新しいガイド',
      unchanged: '変更なし',
      localeSwitcher: '言語',
    }),
  }
}

export function prefixedLocaleCases() {
  return Object.entries(localeFixture())
    .filter(([prefix]) => prefix !== '/')
    .map(([prefix, config]) => {
      const sidebar = config.theme?.sidebar as Record<string, Array<{ title: string, items?: Array<{ title: string, to?: string }> }>> | undefined
      const group = sidebar?.['/guide/']?.[0]
      const items = group?.items ?? []
      return {
        prefix,
        lang: config.lang,
        label: config.label,
        historicalGuide: `${prefix}v/2026-08-27/guide/`,
        historicalPrefix: `${prefix}v/2026-08-27/`,
        currentI18n: `${prefix}guide/i18n/`,
        sidebarTitle: group?.title ?? '',
        prevTitle: items[0]?.title ?? '',
        nextTitle: items[2]?.title ?? '',
      }
    })
}
