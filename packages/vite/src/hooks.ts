import type { Handle } from '@sveltejs/kit'
import type { LocalesConfig } from './types.js'
import { resolveLocale } from './locale.js'

export interface CreateLocaleHandleOptions {
  defaultLang?: string
  base?: string
}

/**
 * Create a SvelteKit server `handle` hook that injects the active locale's
 * `lang` attribute into the SSR `<html>` element.
 *
 * @param locales The configured locales map
 * @param options Optional configuration including fallback defaultLang and base path
 */
export function createLocaleHandle(
  locales: LocalesConfig,
  options?: CreateLocaleHandleOptions,
): Handle {
  const defaultLang = options?.defaultLang ?? locales['/']?.lang ?? 'en'

  return async ({ event, resolve }) => {
    const lang = resolveLocale(event.url.pathname, locales, options?.base)?.lang ?? defaultLang
    return resolve(event, {
      transformPageChunk: ({ html }) =>
        html.replace(/<html(\s[^>]*)?>/i, (_, attrs = '') => {
          const cleanAttrs = attrs.replace(/\s+lang=(["'])[\s\S]*?\1/i, '')
          return `<html lang="${lang}"${cleanAttrs}>`
        }),
    })
  }
}
