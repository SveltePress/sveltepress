import type { PluginOption } from 'vite'
import type { Highlighter, LlmsConfig, LoadTheme, LocaleConfig, LocalesConfig, LocaleSwitchTarget, LocaleVersionSnapshot, ResolvedLocale, ResolvedTheme, SiteConfig, SveltepressVitePluginOptions, ThemeVitePlugins } from './types.js'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import vitePluginInspect from 'vite-plugin-inspect'
import mdToSvelte from './markdown/md-to-svelte.js'
import { indexSiteWithPagefind, syncHistoricalPagefind } from './pagefind.js'
import SveltepressVitePlugin from './plugin.js'
import { assertNoSvelteConfigFile, resolveSvelteKitOptions, svelteKitMajor } from './utils/resolve-svelte-kit-options.js'

export * from './pagefind.js'
export * from './theme-snapshot.js'

const sveltepress: (options?: SveltepressVitePluginOptions) => PluginOption = async ({
  theme,
  addInspect,
  siteConfig,
  remarkPlugins,
  rehypePlugins,
  llms,
  versions,
  svelteKitOptions,
  locales,
  pagefind,
} = {
  addInspect: false,
}) => {
  async function indexPagefind() {
    if (process.env.SVELTEPRESS_SKIP_PAGEFIND)
      return
    const opts = typeof pagefind === 'object' ? pagefind : undefined
    const siteRoot = process.cwd()
    const candidates = [
      resolve(siteRoot, 'dist'),
      resolve(siteRoot, 'build'),
    ]
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        await indexSiteWithPagefind(candidate, { ...opts, siteRoot })
        await syncHistoricalPagefind(siteRoot, candidate, opts)
        break
      }
    }
  }

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
      versions,
      locales,
    }),
    // must come before sveltekit, and after sveltepress
    enhancedImages(),
    {
      name: 'sveltepress:svelte-config-check',
      enforce: 'pre',
      // runs before SvelteKit's own check so users get Sveltepress specific advice
      config: {
        order: 'pre',
        handler(config) {
          assertNoSvelteConfigFile(config.root ? resolve(config.root) : process.cwd())
        },
      },
    } as PluginOption,
    // `sveltepress()` sets up SvelteKit itself, so users must NOT also add
    // `sveltekit()` to their vite plugins (doing so compiles every svelte file
    // twice and crashes with "Expected token }"). `svelteKitOptions` lets users
    // on the newer layout — where config lives inline in `vite.config.ts` and
    // there is no `svelte.config.js` (always the case on SvelteKit 3) —
    // forward their config here instead.
    sveltekit(resolveSvelteKitOptions(svelteKitOptions)),
    ...(pagefind === false
      ? []
      : [{
          name: 'sveltepress:pagefind',
          apply: 'build',
          enforce: 'post',
          // Index once the adapter has written the site: SvelteKit 2 runs the
          // adapter in `closeBundle`, SvelteKit 3 in a `buildApp` hook that
          // runs after every environment is built.
          ...(svelteKitMajor() >= 3
            ? { buildApp: { order: 'post', handler: indexPagefind } }
            : { closeBundle: { sequential: true, order: 'post', handler: indexPagefind } }),
        }] as PluginOption[]),
  ]

  theme?.configureVersions?.(versions)

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
export type { Highlighter, LlmsConfig, LoadTheme, LocaleConfig, LocalesConfig, LocaleSwitchTarget, LocaleVersionSnapshot, ResolvedLocale, ResolvedTheme, SiteConfig, SveltepressVitePluginOptions, ThemeVitePlugins }
export * as log from './utils/log.js'
export * from './versioning/index.js'
