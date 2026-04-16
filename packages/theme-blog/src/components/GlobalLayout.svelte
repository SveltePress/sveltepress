<!-- src/components/GlobalLayout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { BlogThemeOptions } from '../types.js'
  import Navbar from './Navbar.svelte'

  interface Props {
    themeOptions?: BlogThemeOptions
    children?: Snippet
  }

  const { themeOptions, children }: Props = $props()

  const primary = themeOptions?.themeColor?.primary ?? '#fb923c'
  const secondary = themeOptions?.themeColor?.secondary ?? '#dc2626'
  const bg = themeOptions?.themeColor?.bg ?? '#1a0a00'
  const surface = themeOptions?.themeColor?.surface ?? '#2d1200'

  // Build CSS variable string — injected via svelte:head {@html} since Svelte
  // does not support interpolation inside <style> blocks.
  const cssVars = `:root{--sp-blog-primary:${primary};--sp-blog-secondary:${secondary};--sp-blog-bg:${bg};--sp-blog-surface:${surface};--sp-blog-text:#fff7ed;--sp-blog-muted:#a16207;--sp-blog-border:#3f1c04;}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}body{background:var(--sp-blog-bg);color:var(--sp-blog-text);font-family:Inter,system-ui,sans-serif;line-height:1.6;}code,pre{font-family:'JetBrains Mono','Fira Code',monospace;}a{color:var(--sp-blog-primary);text-decoration:none;}a:hover{text-decoration:underline;}`
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<style>${cssVars}</style>`}
</svelte:head>

<Navbar
  title={themeOptions?.title ?? 'Blog'}
  links={themeOptions?.navbar ?? []}
/>

<main class="sp-blog-main">
  {@render children?.()}
</main>

<style>
  .sp-blog-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
</style>
