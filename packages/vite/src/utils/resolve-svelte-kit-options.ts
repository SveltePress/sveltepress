import type { SvelteKitOptions } from '../types.js'

/**
 * Normalize the SvelteKit options forwarded to the internal `sveltekit()` call.
 *
 * When no options are provided we pass `undefined` through so SvelteKit keeps
 * reading `svelte.config.js` (the classic layout). When options are provided
 * (the inline `vite.config.ts` layout) we make sure `'.md'` is registered as an
 * extension, since Sveltepress relies on it to treat markdown files as routes.
 */
export function resolveSvelteKitOptions(options?: SvelteKitOptions): SvelteKitOptions {
  if (!options)
    return undefined

  const extensions = Array.from(new Set([...(options.extensions ?? ['.svelte']), '.md']))
  return {
    ...options,
    extensions,
  }
}
