import type { Plugin } from 'vite'
import Unocss from 'unocss/vite'
import { presetIcons, presetUno, presetAttributify } from 'unocss'
import { safelist } from '@svelte-press/remark-live-code'
import CorePlugin from './plugin.js'

const unoPlugins = Unocss({
  presets: [
    presetAttributify(),
    presetUno(),
    presetIcons(),
  ],
  safelist
})

const VitePlugSveltepress: () => (Plugin | Plugin[])[] = () => {

  return [
    unoPlugins, 
    CorePlugin(),
  ]
}

export default VitePlugSveltepress
