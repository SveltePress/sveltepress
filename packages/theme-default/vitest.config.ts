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
      { find: 'virtual:sveltepress/theme-default/versioning', replacement: resolve(import.meta.dirname, 'src/components/versioning.ts') },
      { find: 'virtual:sveltepress/theme-default/VersionSelector.svelte', replacement: resolve(import.meta.dirname, 'src/components/VersionSelector.svelte') },
      { find: 'virtual:sveltepress/theme-default/VersionFallbackNotice.svelte', replacement: resolve(import.meta.dirname, 'src/components/VersionFallbackNotice.svelte') },
      { find: 'virtual:sveltepress/theme-default/VersionLifecycleBanner.svelte', replacement: resolve(import.meta.dirname, 'src/components/VersionLifecycleBanner.svelte') },
      { find: 'virtual:sveltepress/theme-default/LocaleSelector.svelte', replacement: resolve(import.meta.dirname, 'src/components/LocaleSelector.svelte') },
      { find: 'virtual:sveltepress/theme-default/LocaleFallbackNotice.svelte', replacement: resolve(import.meta.dirname, 'src/components/LocaleFallbackNotice.svelte') },
      { find: 'virtual:sveltepress/theme-default/custom-search', replacement: resolve(import.meta.dirname, '__tests__/fixtures/custom-search.ts') },
      { find: 'virtual:sveltepress/theme-default', replacement: resolve(import.meta.dirname, '__tests__/fixtures/theme-options.ts') },
      { find: 'virtual:sveltepress/locale', replacement: resolve(import.meta.dirname, '__tests__/fixtures/locale.ts') },
      { find: 'virtual:sveltepress/versions', replacement: resolve(import.meta.dirname, '__tests__/fixtures/versions.ts') },
      { find: 'virtual:sveltepress/site', replacement: resolve(import.meta.dirname, '__tests__/fixtures/site.ts') },
      { find: 'virtual:uno.css', replacement: resolve(import.meta.dirname, '__tests__/fixtures/empty.css') },
      { find: '$app/state', replacement: resolve(import.meta.dirname, '__tests__/fixtures/app-state.svelte.ts') },
      { find: '$app/navigation', replacement: resolve(import.meta.dirname, '__tests__/fixtures/navigation.ts') },
      { find: '$app/paths', replacement: resolve(import.meta.dirname, '__tests__/fixtures/paths.ts') },
      { find: '$app/env', replacement: resolve(import.meta.dirname, '__tests__/fixtures/env.ts') },
    ],
  },
  test: {
    execArgv: process.allowedNodeEnvironmentFlags.has(NO_NODE_WEBSTORAGE) ? [NO_NODE_WEBSTORAGE] : [],
    environmentMatchGlobs: [['**/version-components.test.ts', 'happy-dom']],
    testTimeout: 10000,
  },
})
