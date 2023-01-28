import type { PluginOption } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import vitePluginInspect from 'vite-plugin-inspect'
import SveltepressVitePlugin from './plugin.js'
import type { Highlighter, LoadTheme, SiteConfig, SveltepressVitePluginOptions } from './types.js'
export * as log from './utils/log.js'

const sveltepress: (options: SveltepressVitePluginOptions) => PluginOption = ({
  theme,
  addInspect,
  siteConfig,
} = {
  addInspect: false,
}) => {
  const requiredSiteConfig: Required<SiteConfig> = {
    title: siteConfig?.title || 'Untitled site',
    description: siteConfig?.description || 'Build by Sveltepress',
  }
  const plugins = [
    theme?.vitePlugins,
    SveltepressVitePlugin({ theme, siteConfig: requiredSiteConfig }),
    sveltekit(),
  ]

  if (addInspect)
    plugins.unshift(vitePluginInspect())

  return plugins
}

export { sveltepress }
export type { LoadTheme, Highlighter }
