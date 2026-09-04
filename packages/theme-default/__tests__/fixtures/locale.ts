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

/** A three-locale site fixture mirroring the merged documentation site. */
export function localeFixture(): LocalesConfig {
  return {
    '/': {
      lang: 'en',
      label: 'English',
      theme: { ...themeOptions },
      routes: ['/', '/guide/', '/guide/install/', '/reference/new-api/'],
    },
    '/zh/': {
      lang: 'zh',
      label: '中文',
      theme: {
        ...themeOptions,
        navbar: [{ title: '指南', to: '/guide/' }],
        i18n: {
          ...themeOptions.i18n,
          searchPlaceholder: '搜索文档...',
          searchNoResults: '未找到 "{query}" 的相关结果',
          searchDevNotice: '本地搜索索引在生产构建后生成。',
          localeSwitcher: '切换语言',
          localePageUnavailable: '此页面没有中文版本，已返回中文首页。',
        },
      },
      routes: ['/', '/guide/', '/guide/install/'],
    },
    '/bn/': {
      lang: 'bn',
      label: 'বাংলা',
      theme: { ...themeOptions },
      routes: ['/'],
    },
  }
}
