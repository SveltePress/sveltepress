import type { PluginOption } from 'vite'
import Unocss from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno, transformerDirectives } from 'unocss'
import { sveltekit } from '@sveltejs/kit/vite'
import vitePluginInspect from 'vite-plugin-inspect'
import { safelist } from './markdown/live-code.js'
import SveltepressVitePlugin from './plugin.js'
import type { SiteConfig, SveltepressVitePluginOptions } from './types.js'

const VitePlugSveltepress: (options: SveltepressVitePluginOptions) => PluginOption = ({
  theme = '@svelte-press/theme-default',
  addInspect,
  siteConfig,
} = {
  theme: '@svelte-press/theme-default',
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

export default VitePlugSveltepress
