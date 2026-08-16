<script lang="ts">
  import type { DocSearchProps } from '@docsearch/js'
  import docsearch from '@docsearch/js'
  import { onMount } from 'svelte'
  import '@docsearch/css/dist/style.css'

  const {
    appId,
    apiKey,
    indexName,
    ...rest
  }: Omit<DocSearchProps, 'container' | 'theme'> = $props()

  let containerEl = $state<HTMLDivElement | undefined>()

  // Re-initializing docsearch on theme change (wiping the container and
  // mounting again) silently fails and leaves the button unmounted. Instead
  // we mount ONCE and keep `data-theme` on <html> in sync — docsearch v4's
  // palette and our overrides both key off `[data-theme='dark']`. We must
  // NOT pass the `theme` option: docsearch pins it back onto <html> every
  // time the modal opens, undoing a later manual theme switch.
  function syncTheme() {
    const isDark = document.documentElement.classList.contains('dark')
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }

  // docsearch v4 renders the modal inline in its container instead of
  // portaling to <body> (v3 behavior). Inside the fixed navbar that traps
  // the modal in the header's stacking context (painted under the sidebar)
  // and its backdrop-filter containing block. Lift it out on open — moved
  // DOM keeps working since the listeners live on the nodes themselves.
  function liftModal() {
    const modal = containerEl?.querySelector('.DocSearch-Container')
    if (modal && modal.parentElement !== document.body)
      document.body.appendChild(modal)
  }

  onMount(() => {
    if (!containerEl) return
    syncTheme()
    docsearch({
      container: containerEl,
      appId,
      apiKey,
      indexName,
      ...rest,
    })

    const themeObserver = new MutationObserver(syncTheme)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    const modalObserver = new MutationObserver(liftModal)
    modalObserver.observe(containerEl, { childList: true })

    return () => {
      themeObserver.disconnect()
      modalObserver.disconnect()
    }
  })
</script>

<div bind:this={containerEl} class="ml-4"></div>
