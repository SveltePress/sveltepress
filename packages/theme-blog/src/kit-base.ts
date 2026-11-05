import type { ResolvedConfig } from 'vite'

const SVELTEKIT_SETUP_PLUGIN = 'vite-plugin-sveltekit-setup'

interface KitSetupApi {
  options?: { kit?: { paths?: { base?: string } } }
}

/**
 * SvelteKit's `paths.base` (no trailing slash; `''` at the root), for
 * prefixing site-absolute URLs in post bodies at build time.
 *
 * Vite's `base` is not that: in builds SvelteKit sets it to `./` whenever
 * `paths.relative` is on (the default), and prefixing `/images/a.png` with
 * `.` gives `./images/a.png`, which breaks on every nested page. Read the
 * value from SvelteKit's setup plugin instead, and only fall back to Vite's
 * `base` when it is an absolute path.
 */
export function resolveKitBase(config: Pick<ResolvedConfig, 'base' | 'plugins'> | undefined): string {
  const kitPlugin = config?.plugins?.find(p => p.name === SVELTEKIT_SETUP_PLUGIN)
  const kitBase = (kitPlugin?.api as KitSetupApi | undefined)?.options?.kit?.paths?.base
  if (typeof kitBase === 'string')
    return kitBase.replace(/\/+$/, '')

  const viteBase = config?.base ?? '/'
  if (!viteBase.startsWith('/'))
    return ''
  return viteBase.replace(/\/+$/, '')
}
