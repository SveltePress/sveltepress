import type { PluginOption } from 'vite'
import type { Highlighter, LoadTheme, ResolvedTheme, SiteConfig, SveltepressVitePluginOptions, ThemeVitePlugins } from './types.js'
import { sveltekit } from '@sveltejs/kit/vite'
import vitePluginInspect from 'vite-plugin-inspect'
import mdToSvelte from './markdown/md-to-svelte.js'
import SveltepressVitePlugin from './plugin.js'

export * as log from './utils/log.js'

const sveltepress: (options?: SveltepressVitePluginOptions) => PluginOption = async ({
  theme,
  addInspect,
  siteConfig,
  remarkPlugins,
  rehypePlugins,
} = {
  addInspect: false,
}) => {
  const requiredSiteConfig: Required<SiteConfig> = {
    title: siteConfig?.title || 'Untitled site',
    description: siteConfig?.description || 'Build by Sveltepress',
  }
  const corePlugin = [
    SveltepressVitePlugin({
      theme,
      siteConfig: requiredSiteConfig,
      remarkPlugins,
      rehypePlugins,
    }),
    sveltekit(),
  ]

  const plugins = typeof theme?.vitePlugins === 'function'
    ? await theme.vitePlugins(corePlugin)
    : [
        theme?.vitePlugins,
        ...corePlugin,
      ]
  if (addInspect)
    plugins.unshift(vitePluginInspect())

  return plugins
}

export { mdToSvelte, sveltepress }
export type { Highlighter, LoadTheme, ResolvedTheme, SiteConfig, SveltepressVitePluginOptions, ThemeVitePlugins }
