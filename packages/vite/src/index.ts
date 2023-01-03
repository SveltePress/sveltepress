import type { PluginOption } from 'vite'
import Unocss from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno, transformerDirectives } from 'unocss'
import { sveltekit } from '@sveltejs/kit/vite'
import vitePluginInspect from 'vite-plugin-inspect'
import { safelist } from './markdown/live-code.js'
import SveltepressVitePlugin from './plugin.js'
import type { LoadTheme, SiteConfig, SveltepressVitePluginOptions } from './types.js'

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
    SveltepressVitePlugin({ theme, siteConfig: requiredSiteConfig }),
    Unocss({
      presets: [
        presetAttributify(),
        presetUno(),
        presetIcons(),
      ],
      transformers: [transformerDirectives()],
      safelist,
    }),
    sveltekit(),
  ]

  if (addInspect)
    plugins.unshift(vitePluginInspect())

  return plugins
}

export { sveltepress }
export type { LoadTheme }
