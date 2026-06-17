const RELATIVE_SVELTEKIT_ASSET_RE = /(["'])\.\/_app\/immutable\//g

export function normalizeVitePreloadPaths(code: string): string {
  if (!code.includes('__vite__mapDeps'))
    return code

  return code.replace(RELATIVE_SVELTEKIT_ASSET_RE, '$1/_app/immutable/')
}
