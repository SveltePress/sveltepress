import { sveltekit } from '@sveltejs/kit/vite'
import Unocss from 'unocss/vite'
import { presetIcons, presetUno } from 'unocss'
import { defineConfig } from 'vite'
import VitePlugSveltepress from '@svelte-press/vite'

const config = defineConfig({
  plugins: [
    Unocss({
      mode: 'svelte-scoped',
      presets: [
        presetIcons(),
        presetUno(),
      ],
    }),
    sveltekit(),
    VitePlugSveltepress(),
  ],
})

export default config
