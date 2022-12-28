import { defineConfig } from 'vite'
import VitePlugSveltepress from '@svelte-press/vite'

const config = defineConfig({
  plugins: [
    VitePlugSveltepress(),
  ],
})

export default config
