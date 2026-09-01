import type { ResolvedLocale } from '@sveltepress/vite'
import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'
import { resolveLocale, resolveLocalizedPath } from 'virtual:sveltepress/locale'
import themeOptions from 'virtual:sveltepress/theme-default'

/**
 * Resolve the theme options for the current route: the matched locale's theme
 * options when locales are configured, otherwise the site-level theme options.
 */
export function resolveLocaleOptions(pathname: string): DefaultThemeOptions {
  const locale = resolveLocale(pathname)
  return (locale?.theme ?? themeOptions) as DefaultThemeOptions
}

/**
 * Resolve the active locale for the current route.
 */
export function resolveLocaleForPath(pathname: string): ResolvedLocale | null {
  return resolveLocale(pathname)
}

/**
 * Resolve an internal link within the active locale of the current route.
 */
export function resolveLocaleLink(to: string, pathname: string): string {
  const locale = resolveLocale(pathname)
  return resolveLocalizedPath(to, locale)
}
