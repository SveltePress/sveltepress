import { sveltekit } from '@sveltejs/kit/vite'
import Unocss from 'unocss/vite'
import { presetIcons, presetUno, presetAttributify } from 'unocss'
import { defineConfig } from 'vite'
import VitePlugSveltepress, { safelist } from '@svelte-press/vite'

const config = defineConfig({
  plugins: [
    VitePlugSveltepress(),
    Unocss({
      presets: [
        presetAttributify(),
        presetUno(),
        presetIcons(),
      ],
      safelist
    }),
    sveltekit(),
  ],
})

export default config
