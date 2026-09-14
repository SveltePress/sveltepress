import { resolve } from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ['browser'],
    alias: [
      { find: '$app/state', replacement: resolve(import.meta.dirname, '__tests__/fixtures/app-state.svelte.ts') },
      { find: '$app/navigation', replacement: resolve(import.meta.dirname, '__tests__/fixtures/navigation.ts') },
      { find: '$app/environment', replacement: resolve(import.meta.dirname, '__tests__/fixtures/environment.ts') },
      { find: '$app/paths', replacement: resolve(import.meta.dirname, '__tests__/fixtures/paths.ts') },
    ],
  },
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    environmentMatchGlobs: [
      ['**/playground-pagefind.test.ts', 'happy-dom'],
      ['**/hosted-editor.test.ts', 'happy-dom'],
    ],
  },
})
