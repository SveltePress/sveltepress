import { sveltekit } from '@sveltejs/kit/vite'
import Unocss from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno } from 'unocss'
import { defineConfig } from 'vite'
import vitePluginMdsvex from './plugins/vite/vite-plugin-mdsvex'

const config = defineConfig({
  plugins: [
    vitePluginMdsvex(),
    Unocss({
      presets: [
        presetAttributify(),
        presetIcons(),
        presetUno(),
      ],
    }),
    sveltekit(),
  ],
})

export default config
