import type { KitConfig } from '@sveltejs/kit'
import type { PluginOption } from 'vite'
import type { Highlighter, LlmsConfig, LoadTheme, ResolvedTheme, SiteConfig, SveltepressVitePluginOptions, ThemeVitePlugins } from './types.js'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import vitePluginInspect from 'vite-plugin-inspect'
import mdToSvelte from './markdown/md-to-svelte.js'
import SveltepressVitePlugin from './plugin.js'

export * as log from './utils/log.js'

/**
 * Returns the SveltePress Vite plugins.
 * You can also pass the SvelteKit configuration directly to this plugin,
 * in which case `svelte.config.js` is ignored.
 */
const sveltepress: (options?: SveltepressVitePluginOptions & KitConfig) => PluginOption = async ({
  theme,
  addInspect,
  siteConfig,
  remarkPlugins,
  rehypePlugins,
  llms,
  ...kitConfig
} = {
  addInspect: false,
}) => {
  const requiredSiteConfig: Required<SiteConfig> = {
    title: siteConfig?.title || 'Untitled site',
    description: siteConfig?.description || 'Built by SveltePress',
  }

  const corePlugin = [
    SveltepressVitePlugin({
      theme,
      siteConfig: requiredSiteConfig,
      remarkPlugins,
      rehypePlugins,
      llms,
    }),
    // must come before sveltekit, and after sveltepress
    enhancedImages(),
    sveltekit((Object.keys(kitConfig).length > 0) ? kitConfig : undefined),
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
export type { Highlighter, LlmsConfig, LoadTheme, ResolvedTheme, SiteConfig, SveltepressVitePluginOptions, ThemeVitePlugins }
