import { resolve } from 'node:path'
import process from 'node:process'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

// Node 25+ defines a global `localStorage` that stays undefined without
// --localstorage-file, and it shadows happy-dom's storage. Turn Node's Web
// Storage off in the test workers (Node versions without the flag skip it).
const NO_NODE_WEBSTORAGE = '--no-experimental-webstorage'

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
    execArgv: process.allowedNodeEnvironmentFlags.has(NO_NODE_WEBSTORAGE) ? [NO_NODE_WEBSTORAGE] : [],
    include: ['__tests__/**/*.test.ts'],
    environmentMatchGlobs: [
      ['**/playground-pagefind.test.ts', 'happy-dom'],
      ['**/hosted-editor.test.ts', 'happy-dom'],
    ],
  },
})
