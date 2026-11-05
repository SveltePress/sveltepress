<!-- src/components/Demos.svelte -->
<!--
  Mounts the project's own Svelte components that a post uses as tags
  (`<Name prop="…" />`, see remark-demos). The remark plugin leaves an empty
  `.sp-demo[data-demo]` where the tag was and the vite plugin exposes the
  project's demos directory as lazy imports; this loads the ones on the page
  and mounts each into its placeholder, so the demo stays where the author
  wrote it.
-->
<script lang="ts">
  import { mount, onMount, unmount } from 'svelte'
  import { demos } from 'virtual:sveltepress/blog-demos'

  onMount(() => {
    let destroyed = false
    const mounted: Record<string, unknown>[] = []
    const targets = document.querySelectorAll<HTMLElement>(
      '.sp-post-content .sp-demo[data-demo]',
    )
    for (const target of targets) {
      const name = target.dataset.demo ?? ''
      const load = demos[name]
      if (!load) {
        target.dataset.state = 'error'
        target.textContent = `Demo "${name}" not found.`
        continue
      }
      let props: Record<string, unknown> = {}
      try {
        props = JSON.parse(target.dataset.props || '{}')
      } catch {}
      target.dataset.state = 'loading'
      load()
        .then(({ default: Demo }) => {
          if (destroyed) return
          target.replaceChildren()
          mounted.push(mount(Demo, { target, props }))
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
  :global(.sp-post-content div.sp-demo) {
    margin: 0 0 1.25rem;
  }
  :global(.sp-post-content .sp-demo[data-state='error']) {
    color: var(--sp-blog-secondary, #dc2626);
    font-family: monospace;
    font-size: 0.85rem;
  }
</style>
