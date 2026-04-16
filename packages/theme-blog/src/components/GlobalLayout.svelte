<!-- src/components/GlobalLayout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'
  import { blogConfig } from 'virtual:sveltepress/blog-config'
  import Navbar from './Navbar.svelte'
  import ThemeToggle from './ThemeToggle.svelte'

  interface Props {
    children?: Snippet
    search?: Snippet
  }

  const { children, search }: Props = $props()

  // Inject user-customised CSS variable overrides at runtime.
  // We use a <style> element (not {@html} in <svelte:head>) to avoid
  // the svelte2tsx build failure that {@html `<style>...</style>`} triggers.
  $effect(() => {
    const dark = blogConfig.themeColor
    const light = blogConfig.themeColorLight
    if (!dark && !light) return
    const lines: string[] = []
    if (dark) {
      const vars = Object.entries({
        '--sp-blog-primary': dark.primary,
        '--sp-blog-secondary': dark.secondary,
        '--sp-blog-bg': dark.bg,
        '--sp-blog-surface': dark.surface,
      })
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}:${v}`)
        .join(';')
      if (vars) lines.push(`[data-theme="dark"] .sp-blog-root{${vars}}`)
    }
    if (light) {
      const vars = Object.entries({
        '--sp-blog-primary': light.primary,
        '--sp-blog-secondary': light.secondary,
        '--sp-blog-bg': light.bg,
        '--sp-blog-surface': light.surface,
      })
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}:${v}`)
        .join(';')
      if (vars) lines.push(`[data-theme="light"] .sp-blog-root{${vars}}`)
    }
    if (!lines.length) return
    const style = document.createElement('style')
    style.id = 'sp-blog-custom-theme'
    style.textContent = lines.join('\n')
    document.head.appendChild(style)
    return () => style.remove()
  })
</script>

<svelte:head>
  <title>{blogConfig.title ?? 'Blog'}</title>
</svelte:head>

<div class="sp-blog-root">
  <Navbar
    title={blogConfig.title ?? 'Blog'}
    links={blogConfig.navbar ?? []}
    {search}
  >
    {#snippet toggle()}<ThemeToggle />{/snippet}
  </Navbar>
  <main class="sp-blog-main">
    {@render children?.()}
  </main>
</div>

<style>
  /* ── Dark palette (default) ───────────────────────────────── */
  :global([data-theme='dark']) .sp-blog-root {
    --sp-blog-bg: #1a0a00;
    --sp-blog-surface: #2d1200;
    --sp-blog-border: #3f1c04;
    --sp-blog-text: #fff7ed;
    --sp-blog-muted: #a16207;
    --sp-blog-content: #d6d3d1;
    --sp-blog-primary: #fb923c;
    --sp-blog-secondary: #dc2626;
  }

  /* ── Light palette (warm cream) ──────────────────────────── */
  :global([data-theme='light']) .sp-blog-root {
    --sp-blog-bg: #fef9f0;
    --sp-blog-surface: #fde8c8;
    --sp-blog-border: #e8d5b0;
    --sp-blog-text: #1c0a00;
    --sp-blog-muted: #92400e;
    --sp-blog-content: #44260a;
    --sp-blog-primary: #c2410c;
    --sp-blog-secondary: #dc2626;
  }

  /* ── Base layout ─────────────────────────────────────────── */
  .sp-blog-root {
    background: var(--sp-blog-bg, #1a0a00);
    color: var(--sp-blog-text, #fff7ed);
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
