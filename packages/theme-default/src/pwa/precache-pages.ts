/**
 * Control which prerendered HTML files go into the Workbox precache.
 *
 * Default `false` only precaches the homepage so SW install/update stays
 * cheap when the site has many versions and locales.
 *
 * - `false` / omitted: homepage only
 * - `true`: every prerendered HTML file (except historical versions, which
 *   are still glob-ignored)
 * - `string[]`: homepage + URL prefixes, e.g. `['/zh/', '/v/2026-08-27/']`
 */
export type PrecachePages = boolean | string[]

/** Catch-all used when `precacheClient: true`. */
export const PWA_CLIENT_GLOB = 'client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}'
/** SvelteKit start/app entry modules (hashed filenames live under this directory). */
export const PWA_CLIENT_ENTRY_GLOB = 'client/_app/immutable/entry/**/*.{js,css}'
/** Hashed CSS and fonts referenced by the shell. */
export const PWA_CLIENT_ASSETS_GLOB = 'client/_app/immutable/assets/**/*.{css,otf,woff,woff2}'
/** Root-level PWA / favicon images (not nested under `_app`). */
export const PWA_CLIENT_ROOT_ICONS_GLOB = 'client/*.{ico,png,svg,webp}'
export const PWA_HOME_GLOB = 'prerendered/pages/index.html'
export const PWA_ALL_HTML_GLOB = 'prerendered/**/*.html'

export const PWA_SHELL_CLIENT_GLOBS = [
  PWA_CLIENT_ENTRY_GLOB,
  PWA_CLIENT_ASSETS_GLOB,
  PWA_CLIENT_ROOT_ICONS_GLOB,
] as const

/**
 * Map a site URL prefix to Workbox globs under `.svelte-kit/output`.
 * `/zh/` -> `prerendered/pages/zh.html` + `prerendered/pages/zh/**`
 */
export function prefixToPrerenderedGlobs(prefix: string): string[] {
  const clean = prefix.trim().replace(/^\/+/, '').replace(/\/+$/, '')
  if (!clean)
    return [PWA_HOME_GLOB]
  return [
    `prerendered/pages/${clean}.html`,
    `prerendered/pages/${clean}/**`,
  ]
}

function clientGlobs(precacheClient = false): string[] {
  return precacheClient ? [PWA_CLIENT_GLOB] : [...PWA_SHELL_CLIENT_GLOBS]
}

/**
 * Build `injectManifest` / `workbox` `globPatterns`.
 *
 * A glob starting with `prerendered/` MUST be present, otherwise
 * `@vite-pwa/sveltekit` appends a catch-all for every prerendered HTML/JSON
 * file and every version/locale page is hashed into the precache again.
 *
 * Default `precacheClient` is shell-only (entry + CSS/fonts + root icons)
 * so Workbox install stays cheap. `true` restores the catch-all client glob.
 */
export function resolvePrecacheGlobPatterns(
  precachePages: PrecachePages = false,
  precacheClient = false,
): string[] {
  const client = clientGlobs(precacheClient)
  if (precachePages === true)
    return [...client, PWA_ALL_HTML_GLOB]

  if (Array.isArray(precachePages)) {
    const extra = precachePages.flatMap(prefixToPrerenderedGlobs)
    return [...new Set([...client, PWA_HOME_GLOB, ...extra])]
  }

  return [...client, PWA_HOME_GLOB]
}

/** Runtime-cache visited pages unless every HTML file is already precached. */
export function shouldRuntimeCachePages(precachePages: PrecachePages = false): boolean {
  return precachePages !== true
}

/** Runtime-cache hashed modules unless every client file is already precached. */
export function shouldRuntimeCacheClient(precacheClient = false): boolean {
  return precacheClient !== true
}
