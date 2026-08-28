import type { VersionNavigationItem } from './versioning/index.js'
import { resolveConfig } from 'vite'

export interface SveltepressThemeSnapshot {
  sidebar?: Record<string, VersionNavigationItem[]>
}

/** Resolve JSON-serializable author-time theme data without running a build. */
export async function resolveSveltepressThemeSnapshot(root: string): Promise<SveltepressThemeSnapshot> {
  const config = await resolveConfig({ root }, 'build', 'production')
  const plugin = config.plugins.find(candidate => candidate.name === '@sveltepress/default-theme') as {
    api?: { sveltepress?: { themeSnapshot?: unknown } }
  } | undefined
  if (!plugin?.api?.sveltepress?.themeSnapshot)
    return {}
  try {
    return JSON.parse(JSON.stringify(plugin.api.sveltepress.themeSnapshot)) as SveltepressThemeSnapshot
  }
  catch (error) {
    throw new Error(`Default Theme snapshot data must be JSON-serializable: ${(error as Error).message}`)
  }
}
