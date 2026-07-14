import type { PluginOption } from 'vite'
import type { Highlighter, LlmsConfig, LoadTheme, ResolvedTheme, SiteConfig, SveltepressVitePluginOptions, ThemeVitePlugins } from './types.js'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import vitePluginInspect from 'vite-plugin-inspect'
import mdToSvelte from './markdown/md-to-svelte.js'
import SveltepressVitePlugin from './plugin.js'
import { resolveSvelteKitOptions } from './utils/resolve-svelte-kit-options.js'

export * as log from './utils/log.js'

const sveltepress: (options?: SveltepressVitePluginOptions) => PluginOption = async ({
  theme,
  addInspect,
  siteConfig,
  remarkPlugins,
  rehypePlugins,
  llms,
  svelteKitOptions,
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
      llms,
    }),
    // must come before sveltekit, and after sveltepress
    enhancedImages(),
    // `sveltepress()` sets up SvelteKit itself, so users must NOT also add
    // `sveltekit()` to their vite plugins (doing so compiles every svelte file
    // twice and crashes with "Expected token }"). `svelteKitOptions` lets users
    // on the newer layout — where config lives inline in `vite.config.ts` and
    // there is no `svelte.config.js` — forward their config here instead.
    sveltekit(resolveSvelteKitOptions(svelteKitOptions)),
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
