import { resolve } from '$app/paths'

/**
 * SvelteKit's `paths.base`. `base` was removed from `$app/paths` in SvelteKit 3,
 * while `resolve('/')` returns the base path followed by `/` in both SvelteKit
 * 2 and 3.
 */
export function getBase(): string {
  return resolve('/').slice(0, -1)
}
