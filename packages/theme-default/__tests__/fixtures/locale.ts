import type { LocalesConfig, ResolvedLocale } from '@sveltepress/vite'
import {
  resolveLocale as resolveLocaleHelper,
  resolveLocaleSwitch as resolveLocaleSwitchHelper,
  resolveLocalizedPath as resolveLocalizedPathHelper,
} from '@sveltepress/vite/locale'
import themeOptions from './theme-options'

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

export const resolveLocale = (pathname: string) => resolveLocaleHelper(pathname, locales)
export const resolveLocalizedPath = (to: string, locale: ResolvedLocale | null) => resolveLocalizedPathHelper(to, locale, locales)
export const resolveLocaleSwitch = (pathname: string, targetPrefix: string) => resolveLocaleSwitchHelper(pathname, targetPrefix, locales)

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
