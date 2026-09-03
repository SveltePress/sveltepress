import type { ResolvedLocale } from '@sveltepress/vite'
import type { DefaultThemeOptions } from 'virtual:sveltepress/theme-default'
import { resolveLocale, resolveLocalizedPath } from 'virtual:sveltepress/locale'
import themeOptions from 'virtual:sveltepress/theme-default'

/**
 * Resolve the theme options for the current route: the matched locale's theme
 * options **merged over** the site-level theme options when locales are
 * configured, otherwise the site-level theme options. The site-level options
 * carry shared chrome config (logo, github, discord, ga, themeColor, pwa, ...)
 * that every locale inherits; the locale theme only overrides the per-locale
 * parts (navbar, sidebar, editLink, docsearch, i18n, ...).
 */
export function resolveLocaleOptions(pathname: string): DefaultThemeOptions {
  const locale = resolveLocale(pathname)
  return locale?.theme
    ? { ...themeOptions, ...locale.theme }
    : themeOptions
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

/**
 * Strip the active locale's prefix from a route id, returning the logical
 * route shared across locales (e.g. `/zh/guide/introduction` →
 * `/guide/introduction`). Sidebar keys, link targets, and active-state
 * comparisons all live in logical space while the page route id carries the
 * locale prefix.
 */
export function resolveLogicalRoute(routeId: string): string {
  if (!routeId || typeof routeId !== 'string')
    return ''
  const locale = resolveLocale(routeId)
  if (locale && locale.prefix !== '/') {
    const normalizedPrefix = locale.prefix.replace(/\/+$/, '')
    if (routeId === normalizedPrefix)
      return '/'
    if (routeId.startsWith(`${normalizedPrefix}/`))
      return `/${routeId.slice(normalizedPrefix.length + 1)}`
  }
  return routeId
}
