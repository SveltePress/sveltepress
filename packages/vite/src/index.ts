import type { PluginOption } from 'vite'
import Unocss from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno, transformerDirectives } from 'unocss'
import { safelist } from '@svelte-press/remark-live-code'
import { sveltekit } from '@sveltejs/kit/vite'
import vitePluginInspect from 'vite-plugin-inspect'
import SveltepressVitePlugin from './plugin.js'

const VitePlugSveltepress: () => PluginOption = () => {
  return [
    vitePluginInspect(),
    SveltepressVitePlugin(),
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
}

export default VitePlugSveltepress
