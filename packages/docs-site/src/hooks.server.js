import { sequence } from '@sveltejs/kit/hooks'
import { createLocaleHandle } from '@sveltepress/vite/hooks'
import { locales } from '../config/locales.ts'
import { isolationHandle } from './lib/isolation-headers.ts'

/**
 * Emit the active locale's language on the SSR `<html>` element. The theme
 * keeps `document.documentElement.lang` in sync after client-side navigation;
 * this hook covers the initial server-rendered document so the language is
 * correct before hydration and for crawlers.
 *
 * Isolation headers must come first so `createLocaleHandle` still receives
 * `transformPageChunk`. Vite `server.headers` do not apply to SvelteKit HTML.
 */
export const handle = sequence(isolationHandle, createLocaleHandle(locales))
