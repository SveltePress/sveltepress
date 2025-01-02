declare module '@sveltejs/kit/vite' {
  import type { Plugin } from 'vite'

  export function sveltekit(): Promise<Plugin[]>
  export { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
}
