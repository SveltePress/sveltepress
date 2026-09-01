import { resolveLocale } from '@sveltepress/vite/locale'
import { locales } from '../config/locales.ts'

const DEFAULT_LANG = locales['/']?.lang ?? 'en'

/**
 * Emit the active locale's language on the SSR `<html>` element. The theme
 * keeps `document.documentElement.lang` in sync after client-side navigation;
 * this hook covers the initial server-rendered document so the language is
 * correct before hydration and for crawlers.
 */
export async function handle({ event, resolve }) {
  const lang = resolveLocale(event.url.pathname, locales)?.lang ?? DEFAULT_LANG
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('<html lang="en">', `<html lang="${lang}">`),
  })
}
