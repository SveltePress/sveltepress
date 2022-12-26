import { sveltekit } from '@sveltejs/kit/vite'
import Unocss from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno } from 'unocss'
import { defineConfig } from 'vite'
import VitePlugSveltepress from './src/plugins/vite-plugin-sveltepress'

const config = defineConfig({
  plugins: [
    Unocss({
      presets: [
        presetAttributify(),
        presetIcons(),
        presetUno(),
      ],
    }),
    sveltekit(),
    VitePlugSveltepress(),
  ],
})

export default config
