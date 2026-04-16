import type { ResolvedTheme } from '@sveltepress/vite'
import type { BlogThemeOptions } from './types.js'
import { blogVitePlugin } from './vite-plugin.js'

export type { BlogPost, BlogThemeOptions } from './types.js'

export function blogTheme(options: BlogThemeOptions): ResolvedTheme {
  return {
    name: '@sveltepress/theme-blog',
    globalLayout: '@sveltepress/theme-blog/GlobalLayout.svelte',
    pageLayout: '@sveltepress/theme-blog/PageLayout.svelte',
    vitePlugins: corePlugin => [blogVitePlugin(options), corePlugin],
    // Blog posts don't use the Sveltepress markdown highlighter by default
    // (content is pre-rendered in the virtual module). Provide a passthrough.
    highlighter: async (code, _lang) => code,
  }
}
