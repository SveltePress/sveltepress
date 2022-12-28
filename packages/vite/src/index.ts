import type { PluginOption } from 'vite'
import Unocss from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno, transformerDirectives } from 'unocss'
import { safelist } from '@svelte-press/remark-live-code'
import { sveltekit } from '@sveltejs/kit/vite'
import CorePlugin from './plugin.js'

const unoPlugins = Unocss({
  presets: [
    presetAttributify(),
    presetUno(),
    presetIcons(),
  ],
  transformers: [transformerDirectives()],
  safelist,
})

const VitePlugSveltepress: () => PluginOption = () => {
  return [
    unoPlugins,
    CorePlugin(),
    sveltekit(),
  ]
}

export default VitePlugSveltepress
