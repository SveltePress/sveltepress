import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import VitePlugSveltepress from '@svelte-press/vite'

const config = defineConfig({
  plugins: [
    VitePlugSveltepress(),
    sveltekit(),
  ],
})

export default config
