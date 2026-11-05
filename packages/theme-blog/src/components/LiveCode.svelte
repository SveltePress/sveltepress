<!-- src/components/LiveCode.svelte -->
<!--
  Mounts the components of a post's ```svelte live blocks. remark-live-code
  leaves an empty `.sp-live-code__demo[data-live]` where the demo goes and the
  vite plugin compiles each block to its own component; this loads the ones on
  the page and mounts each into its placeholder, so the demo stays where the
  author wrote it.
-->
<script lang="ts">
  import { mount, onMount, unmount } from 'svelte'
  import { liveCode } from 'virtual:sveltepress/blog-live-code'

  onMount(() => {
    let destroyed = false
    const mounted: Record<string, unknown>[] = []
    const targets = document.querySelectorAll<HTMLElement>(
      '.sp-post-content .sp-live-code__demo[data-live]',
    )
    for (const target of targets) {
      const load = liveCode[target.dataset.live ?? '']
      if (!load) {
        target.dataset.state = 'error'
        target.textContent = 'Live code not found.'
        continue
      }
      target.dataset.state = 'loading'
      load()
        .then(({ default: Demo }) => {
          if (destroyed) return
          target.replaceChildren()
          mounted.push(mount(Demo, { target }))
          target.dataset.state = 'ready'
        })
        .catch((err: unknown) => {
          target.dataset.state = 'error'
          target.textContent = String(err)
        })
    }
    return () => {
      destroyed = true
      for (const instance of mounted) unmount(instance)
    }
  })
</script>

<style>
  :global(.sp-post-content .sp-live-code) {
    margin: 0 0 1.25rem;
    border: 1px solid var(--sp-blog-border);
    border-radius: 8px;
    overflow: hidden;
    /* Demos are UI, not prose: don't inherit the article's serif. */
    font-family: var(--sp-font-sans);
    line-height: 1.5;
  }
  :global(.sp-post-content .sp-live-code__demo) {
    padding: 1.5rem;
    min-height: 3rem;
  }
  :global(.sp-post-content .sp-live-code__demo[data-state='error']) {
    color: var(--sp-blog-secondary, #dc2626);
    font-family: monospace;
    font-size: 0.85rem;
  }
  :global(.sp-post-content .sp-live-code__source) {
    border-top: 1px solid var(--sp-blog-border);
  }
  :global(.sp-post-content .sp-live-code__source > summary) {
    cursor: pointer;
    padding: 0.5rem 1rem;
    color: var(--sp-blog-muted);
    font-size: 0.85rem;
    user-select: none;
  }
  :global(.sp-post-content .sp-live-code__source > summary:hover) {
    color: var(--sp-blog-primary);
  }
  /* The source sits inside the live code frame: drop the code block's own
     frame and gap so it doesn't draw a second border. */
  :global(
    .sp-post-content .sp-live-code .sp-live-code__source .svp-code-block-wrapper
  ) {
    margin: 0;
  }
  :global(.sp-post-content .sp-live-code .sp-live-code__source .svp-code-block),
  :global(
    .sp-post-content .sp-live-code .sp-live-code__source .svp-code-block--title
  ) {
    border: none;
    border-radius: 0;
  }
</style>
