<script lang="ts">
  import type { LeafInfo } from './entries'
  import type { MountTarget } from './mount-at'
  import Cta from './Cta.svelte'
  import { isPlaygroundEntry } from './entries'
  import { mountAt } from './mount-at'

  interface Props {
    leaf: LeafInfo
  }

  const { leaf }: Props = $props()
  const show = $derived(isPlaygroundEntry(leaf))

  function pick(): MountTarget | null {
    if (!show) return null
    if (window.matchMedia('(min-width: 950px)').matches) {
      const toc = document.querySelector('.toc')
      if (toc) return { el: toc, where: 'prepend' }
    }
    return {
      el: document.body,
      where: 'append',
    }
  }
</script>

{#if show}
  <div
    class="svp-proto-slot"
    data-svp-proto-slot="D"
    use:mountAt={{ key: `D:${leaf.logicalPath}`, pick }}
  >
    <p class="hint">This leaf is an Entry</p>
    <Cta tone="dock" playgroundPath={leaf.playgroundPath!} />
  </div>
{/if}

<style>
  .svp-proto-slot {
    padding: 0 1rem 0.75rem;
  }
  .hint {
    margin: 0 0 0.5rem;
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #71717a;
  }
  :global(html.dark) .hint {
    color: #a1a1aa;
  }
  :global(body > .svp-proto-slot) {
    position: fixed;
    z-index: 850;
    left: 0.75rem;
    right: 0.75rem;
    bottom: 5.5rem;
    padding: 0;
    display: flex;
    justify-content: flex-end;
    pointer-events: none;
  }
  :global(body > .svp-proto-slot) .hint {
    display: none;
  }
  :global(body > .svp-proto-slot) :global(button) {
    pointer-events: auto;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
  }
</style>
