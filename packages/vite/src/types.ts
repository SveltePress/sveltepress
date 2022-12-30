export type Theme = `@svelte-press/theme-${'default' | 'blog'}`

export interface SveltepressVitePluginOptions {
  theme?: Theme
  addInspect?: boolean
}
