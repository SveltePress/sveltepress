import { resolve } from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ['browser'],
    alias: [
      { find: 'virtual:sveltepress/theme-default/versioning', replacement: resolve(import.meta.dirname, 'src/components/versioning.ts') },
      { find: 'virtual:sveltepress/theme-default/VersionSelector.svelte', replacement: resolve(import.meta.dirname, 'src/components/VersionSelector.svelte') },
      { find: 'virtual:sveltepress/theme-default/VersionFallbackNotice.svelte', replacement: resolve(import.meta.dirname, 'src/components/VersionFallbackNotice.svelte') },
      { find: 'virtual:sveltepress/theme-default/VersionLifecycleBanner.svelte', replacement: resolve(import.meta.dirname, 'src/components/VersionLifecycleBanner.svelte') },
      { find: 'virtual:sveltepress/theme-default', replacement: resolve(import.meta.dirname, '__tests__/fixtures/theme-options.ts') },
      { find: 'virtual:sveltepress/versions', replacement: resolve(import.meta.dirname, '__tests__/fixtures/versions.ts') },
      { find: 'virtual:sveltepress/site', replacement: resolve(import.meta.dirname, '__tests__/fixtures/site.ts') },
      { find: 'virtual:uno.css', replacement: resolve(import.meta.dirname, '__tests__/fixtures/empty.css') },
      { find: '$app/state', replacement: resolve(import.meta.dirname, '__tests__/fixtures/app-state.svelte.ts') },
      { find: '$app/navigation', replacement: resolve(import.meta.dirname, '__tests__/fixtures/navigation.ts') },
      { find: '$app/paths', replacement: resolve(import.meta.dirname, '__tests__/fixtures/paths.ts') },
      { find: '$app/environment', replacement: resolve(import.meta.dirname, '__tests__/fixtures/environment.ts') },
    ],
  },
  test: {
    environmentMatchGlobs: [['**/version-components.test.ts', 'happy-dom']],
  },
})
