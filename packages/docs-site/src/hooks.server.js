import { createLocaleHandle } from '@sveltepress/vite/hooks'
import { locales } from '../config/locales.ts'

/**
 * Emit the active locale's language on the SSR `<html>` element. The theme
 * keeps `document.documentElement.lang` in sync after client-side navigation;
 * this hook covers the initial server-rendered document so the language is
 * correct before hydration and for crawlers.
 */
export const handle = createLocaleHandle(locales)
