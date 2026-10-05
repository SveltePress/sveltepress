import type { SvelteKitOptions } from '../types.js'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { VERSION } from '@sveltejs/kit'

const SVELTE_CONFIG_FILES = ['svelte.config.js', 'svelte.config.ts']

/** The major version of the installed SvelteKit. */
export function svelteKitMajor(kitVersion: string = VERSION) {
  return Number.parseInt(kitVersion, 10)
}

/**
 * Normalize the SvelteKit options forwarded to the internal `sveltekit()` call.
 *
 * On SvelteKit 2, when no options are provided we pass `undefined` through so
 * SvelteKit keeps reading `svelte.config.js` (the classic layout). SvelteKit 3
 * no longer reads `svelte.config.js`, so options are always forwarded there.
 * Whenever options are forwarded we make sure `'.md'` is registered as an
 * extension, since Sveltepress relies on it to treat markdown files as routes.
 */
export function resolveSvelteKitOptions(options?: SvelteKitOptions, kitVersion: string = VERSION): SvelteKitOptions {
  if (!options && svelteKitMajor(kitVersion) < 3)
    return undefined

  const extensions = Array.from(new Set([...(options?.extensions ?? ['.svelte']), '.md']))
  return {
    ...options,
    extensions,
  }
}

/**
 * SvelteKit 3 refuses to start when a `svelte.config.js` exists. Its own error
 * tells users to pass the config to `sveltekit(...)`, which Sveltepress users
 * must not add — point them at `svelteKitOptions` instead.
 */
export function assertNoSvelteConfigFile(root: string, kitVersion: string = VERSION) {
  if (svelteKitMajor(kitVersion) < 3)
    return
  const file = SVELTE_CONFIG_FILES.find(file => existsSync(resolve(root, file)))
  if (!file)
    return
  throw new Error(
    `[@sveltepress/vite] SvelteKit ${kitVersion} no longer reads \`${file}\`.\n`
    + `Move its options (\`adapter\`, \`compilerOptions\`, \`preprocess\`, and everything that was under \`kit\`) into \`sveltepress({ svelteKitOptions: { ... } })\` in your vite config, then delete \`${file}\`.\n`
    + 'See https://sveltepress.site/guide/quick-start/ for an example.',
  )
}
