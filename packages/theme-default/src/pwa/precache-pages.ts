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

export const PWA_CLIENT_GLOB = 'client/**/*.{js,css,ico,png,svg,webp,otf,woff,woff2}'
export const PWA_HOME_GLOB = 'prerendered/pages/index.html'
export const PWA_ALL_HTML_GLOB = 'prerendered/**/*.html'

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

/**
 * Build `injectManifest` / `workbox` `globPatterns`.
 *
 * A glob starting with `prerendered/` MUST be present, otherwise
 * `@vite-pwa/sveltekit` appends a catch-all for every prerendered HTML/JSON
 * file and every version/locale page is hashed into the precache again.
 */
export function resolvePrecacheGlobPatterns(precachePages: PrecachePages = false): string[] {
  if (precachePages === true)
    return [PWA_CLIENT_GLOB, PWA_ALL_HTML_GLOB]

  if (Array.isArray(precachePages)) {
    const extra = precachePages.flatMap(prefixToPrerenderedGlobs)
    return [...new Set([PWA_CLIENT_GLOB, PWA_HOME_GLOB, ...extra])]
  }

  return [PWA_CLIENT_GLOB, PWA_HOME_GLOB]
}

/** Runtime-cache visited pages unless every HTML file is already precached. */
export function shouldRuntimeCachePages(precachePages: PrecachePages = false): boolean {
  return precachePages !== true
}
