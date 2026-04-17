<!-- src/components/GlobalLayout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'
  import { onNavigate } from '$app/navigation'
  import { base } from '$app/paths'
  import { blogConfig } from 'virtual:sveltepress/blog-config'
  import SearchModal from './SearchModal.svelte'
  import Sidebar from './Sidebar.svelte'
  import ThemeToggle from './ThemeToggle.svelte'
  import '@fontsource-variable/fraunces'
  import '@fontsource/inter/400.css'
  import '@fontsource/inter/500.css'
  import '@fontsource/inter/600.css'
  import '@fontsource/inter/700.css'

  interface Props {
    children?: Snippet
    search?: Snippet
  }

  const { children, search }: Props = $props()

  // OG crawlers require absolute URLs; prefer the fully-qualified
  // `blogConfig.base` when set, else fall back to the subpath base.
  const ogOrigin = blogConfig.base?.replace(/\/$/, '') ?? base
  const ogHome = `${ogOrigin}/og/__home.png`

  // Cross-document view transitions. When the browser supports it and the
  // user hasn't opted out of motion, wrap each SvelteKit navigation in a
  // `document.startViewTransition` so elements sharing a `view-transition-name`
  // (card cover ↔ post hero, card title ↔ post title) morph between pages.
  //
  // We toggle `html.sp-vt-active` around the transition because the masonry
  // cards use `content-visibility: auto`. On back-nav the "new" snapshot is
  // captured before those off-viewport cards get promoted to rendered, so
  // their `view-transition-name` elements are absent from the capture and
  // the morph falls back to a root crossfade. The class lets a global CSS
  // rule force `content-visibility: visible` for the window of the VT.
  onNavigate(navigation => {
    if (typeof document === 'undefined') return
    const start = (
      document as Document & {
        startViewTransition?: (cb: () => void | Promise<void>) => {
          finished: Promise<void>
        }
      }
    ).startViewTransition
    if (!start) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    root.classList.add('sp-vt-active')
    const clear = () => root.classList.remove('sp-vt-active')
    return new Promise<void>(resolve => {
      const transition = start.call(document, async () => {
        resolve()
        await navigation.complete
      })
      transition.finished.then(clear, clear)
    })
  })

  let searchOpen = $state(false)

  $effect(() => {
    const onOpen = () => {
      searchOpen = true
    }
    const onKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchOpen = !searchOpen
      }
    }
    window.addEventListener('sp-search-open', onOpen)
    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('sp-search-open', onOpen)
      window.removeEventListener('keydown', onKeydown)
    }
  })

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
  <meta property="og:site_name" content={blogConfig.title ?? 'Blog'} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={blogConfig.title ?? 'Blog'} />
  {#if blogConfig.description}
    <meta name="description" content={blogConfig.description} />
    <meta property="og:description" content={blogConfig.description} />
  {/if}
  <meta property="og:image" content={ogHome} />
  <meta name="twitter:card" content="summary_large_image" />
  {#if blogConfig.author?.socials?.twitter}
    <meta
      name="twitter:creator"
      content={`@${blogConfig.author.socials.twitter}`}
    />
  {/if}
</svelte:head>

<div class="sp-blog-root">
  <Sidebar
    title={blogConfig.title ?? 'Blog'}
    links={blogConfig.navbar ?? []}
    {search}
  >
    {#snippet toggle()}<ThemeToggle />{/snippet}
  </Sidebar>
  <main class="sp-blog-main">
    {@render children?.()}
  </main>
  <SearchModal open={searchOpen} onClose={() => (searchOpen = false)} />
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
    --sp-font-serif: 'Fraunces Variable', Georgia, serif;
    --sp-font-sans: Inter, system-ui, sans-serif;
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
    --sp-font-serif: 'Fraunces Variable', Georgia, serif;
    --sp-font-sans: Inter, system-ui, sans-serif;
  }

  /* ── Base layout ─────────────────────────────────────────── */
  .sp-blog-root {
    background: var(--sp-blog-bg, #1a0a00);
    color: var(--sp-blog-text, #fff7ed);
    font-family: var(--sp-font-sans);
    line-height: 1.6;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr;
  }

  @media (min-width: 1024px) {
    .sp-blog-root {
      grid-template-columns: 280px 1fr;
    }
    .sp-blog-root :global(.sp-sidebar) {
      position: sticky;
      top: 0;
      max-height: 100vh;
      overflow-y: auto;
    }
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
    max-width: 960px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1.25rem;
    min-width: 0;
  }

  /* ── Shiki dual-theme switching ─────────────────────────── */
  :global([data-theme='dark']) .sp-blog-root :global(.shiki),
  :global([data-theme='dark']) .sp-blog-root :global(.shiki span) {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
    font-style: var(--shiki-dark-font-style) !important;
    font-weight: var(--shiki-dark-font-weight) !important;
    text-decoration: var(--shiki-dark-text-decoration) !important;
  }

  /* ── Code block wrapper ─────────────────────────────────── */
  .sp-blog-root :global(.svp-code-block-wrapper) {
    position: relative;
    margin-bottom: 1.25rem;
  }

  .sp-blog-root :global(.svp-code-block) {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--sp-blog-border);
    border-radius: 8px;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .sp-blog-root :global(.svp-code-block pre.shiki) {
    margin: 0;
    padding: 12px 16px;
    overflow-x: auto;
  }

  .sp-blog-root :global(.svp-code-block pre.shiki code) {
    background: none;
    padding: 0;
    color: inherit;
    font-size: inherit;
    border-radius: 0;
  }

  /* ── Title bar ──────────────────────────────────────────── */
  .sp-blog-root :global(.svp-code-block--title) {
    padding: 8px 16px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--sp-blog-muted);
    background: var(--sp-blog-surface);
    border: 1px solid var(--sp-blog-border);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
  }

  .sp-blog-root :global(.svp-code-block--title + .svp-code-block) {
    border-radius: 0 0 8px 8px;
  }

  /* ── Language label ─────────────────────────────────────── */
  .sp-blog-root :global(.svp-code-block--lang) {
    position: absolute;
    right: 12px;
    bottom: 8px;
    font-size: 0.75rem;
    color: var(--sp-blog-muted);
    opacity: 0.6;
    pointer-events: none;
    user-select: none;
    transition: opacity 0.2s;
  }

  .sp-blog-root :global(.svp-code-block:hover .svp-code-block--lang) {
    opacity: 0;
  }

  /* ── Copy button ────────────────────────────────────────── */
  .sp-blog-root :global(.svp-code-block--copy-btn) {
    position: absolute;
    top: 8px;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--sp-blog-border);
    border-radius: 6px;
    background: var(--sp-blog-surface);
    color: var(--sp-blog-muted);
    cursor: pointer;
    opacity: 0;
    transition:
      opacity 0.2s,
      border-color 0.2s,
      color 0.2s;
    z-index: 10;
  }

  .sp-blog-root :global(.svp-code-block:hover .svp-code-block--copy-btn) {
    opacity: 1;
  }

  .sp-blog-root :global(.svp-code-block--copy-btn:hover) {
    border-color: var(--sp-blog-primary);
    color: var(--sp-blog-primary);
  }

  .sp-blog-root :global(.svp-code-block--copy-btn .svp-code-block--check-icon) {
    display: none;
  }

  .sp-blog-root
    :global(.svp-code-block--copy-btn.copied .svp-code-block--copy-icon) {
    display: none;
  }

  .sp-blog-root
    :global(.svp-code-block--copy-btn.copied .svp-code-block--check-icon) {
    display: flex;
    color: #22c55e;
  }

  /* ── Command overlays ───────────────────────────────────── */
  .sp-blog-root :global(.svp-code-block--command-line) {
    position: absolute;
    left: 0;
    right: 0;
    height: 1.5em;
    pointer-events: none;
  }

  /* Highlight */
  .sp-blog-root :global(.svp-code-block--hl) {
    background: rgba(251, 146, 60, 0.15);
    border-left: 3px solid var(--sp-blog-primary);
  }

  /* Diff add */
  .sp-blog-root :global(.svp-code-block--diff-bg-add) {
    background: rgba(34, 197, 94, 0.15);
    border-left: 3px solid #22c55e;
  }

  .sp-blog-root :global(.svp-code-block--diff-add) {
    position: absolute;
    left: 6px;
    color: #22c55e;
    font-size: 0.75rem;
    font-weight: 700;
    user-select: none;
  }

  /* Diff remove */
  .sp-blog-root :global(.svp-code-block--diff-bg-sub) {
    background: rgba(239, 68, 68, 0.15);
    border-left: 3px solid #ef4444;
  }

  .sp-blog-root :global(.svp-code-block--diff-sub) {
    position: absolute;
    left: 6px;
    color: #ef4444;
    font-size: 0.75rem;
    font-weight: 700;
    user-select: none;
  }

  /* Focus — dim overlay for non-focused lines */
  .sp-blog-root :global(.svp-code-block--focus) {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 4;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(1.5px);
    pointer-events: none;
    transition: opacity 0.2s;
  }

  .sp-blog-root :global(.svp-code-block:hover .svp-code-block--focus) {
    opacity: 0;
  }

  /* ── Line numbers ───────────────────────────────────────── */
  .sp-blog-root :global(.svp-code-block--with-line-numbers pre.shiki) {
    padding-left: 3.5rem;
  }

  .sp-blog-root :global(.svp-code-block--line-numbers) {
    position: absolute;
    top: 12px;
    left: 0;
    width: 3rem;
    text-align: right;
    padding-right: 12px;
    user-select: none;
    pointer-events: none;
  }

  .sp-blog-root :global(.svp-code-block--line-number-item) {
    height: 1.5em;
    line-height: 1.5;
    font-size: 0.875rem;
    color: var(--sp-blog-muted);
    opacity: 0.5;
  }

  /* ── View Transitions — card ↔ post morph ───────────────── */
  :global(::view-transition-group(*)) {
    animation-duration: 420ms;
    animation-timing-function: cubic-bezier(0.2, 0, 0.2, 1);
  }
  :global(::view-transition-old(root)),
  :global(::view-transition-new(root)) {
    animation-duration: 260ms;
  }
  /* Force the lazy-rendered cards to a rendered state while a cross-doc
     VT is in flight so their `view-transition-name` elements participate
     in the "new" snapshot on back-nav. See `onNavigate` above. */
  :global(html.sp-vt-active .sp-card-large),
  :global(html.sp-vt-active .sp-card-small) {
    content-visibility: visible;
  }
  @media (prefers-reduced-motion: reduce) {
    :global(::view-transition-group(*)),
    :global(::view-transition-old(root)),
    :global(::view-transition-new(root)) {
      animation: none !important;
    }
  }
</style>
