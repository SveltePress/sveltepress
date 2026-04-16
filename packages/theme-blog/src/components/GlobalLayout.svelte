<!-- src/components/GlobalLayout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'
  import { blogConfig } from 'virtual:sveltepress/blog-config'
  import Navbar from './Navbar.svelte'

  interface Props {
    children?: Snippet
    search?: Snippet
  }

  const { children, search }: Props = $props()

  // Theme tokens from build-time config via virtual module.
  const themeStyle = [
    `--sp-blog-primary:${blogConfig.themeColor?.primary ?? '#fb923c'}`,
    `--sp-blog-secondary:${blogConfig.themeColor?.secondary ?? '#dc2626'}`,
    `--sp-blog-bg:${blogConfig.themeColor?.bg ?? '#1a0a00'}`,
    `--sp-blog-surface:${blogConfig.themeColor?.surface ?? '#2d1200'}`,
  ].join(';')
</script>

<svelte:head>
  <title>{blogConfig.title ?? 'Blog'}</title>
</svelte:head>

<div class="sp-blog-root" style={themeStyle}>
  <Navbar
    title={blogConfig.title ?? 'Blog'}
    links={blogConfig.navbar ?? []}
    {search}
  />
  <main class="sp-blog-main">
    {@render children?.()}
  </main>
</div>

<style>
  .sp-blog-root {
    --sp-blog-text: #fff7ed;
    --sp-blog-muted: #a16207;
    --sp-blog-border: #3f1c04;
    background: var(--sp-blog-bg, #1a0a00);
    color: var(--sp-blog-text);
    font-family: Inter, system-ui, sans-serif;
    line-height: 1.6;
    min-height: 100vh;
  }

  :global(*),
  :global(*::before),
  :global(*::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    background: var(--sp-blog-bg, #1a0a00);
  }

  :global(code),
  :global(pre) {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }

  :global(a) {
    color: var(--sp-blog-primary, #fb923c);
    text-decoration: none;
  }

  :global(a:hover) {
    text-decoration: underline;
  }

  .sp-blog-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
</style>
