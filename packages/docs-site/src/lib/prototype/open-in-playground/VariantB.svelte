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
    const subNav = document.querySelector('nav.sub-nav')
    if (subNav && window.matchMedia('(max-width: 949px)').matches) {
      return { el: subNav, where: 'append' }
    }
    const title = document.querySelector(
      '.theme-default--page-layout h1.page-title',
    )
    if (title) return { el: title, where: 'after' }
    return null
  }
</script>

{#if show}
  <div
    class="svp-proto-slot"
    data-svp-proto-slot="B"
    use:mountAt={{ key: `B:${leaf.logicalPath}`, pick }}
  >
    <span class="crumb">{leaf.group} · {leaf.name}</span>
    <Cta tone="chip" playgroundPath={leaf.playgroundPath!} />
  </div>
{/if}

<style>
  .svp-proto-slot {
    --at-apply: 'flex items-center justify-between gap-3 mb-5 px-3 py-2 rounded-lg bg-black/3 dark:bg-white/5 b-1 b-solid b-black/8 dark:b-white/10';
  }
  .crumb {
    --at-apply: 'text-[12px] text-zinc-5 dark:text-zinc-4 truncate';
  }
  :global(nav.sub-nav) .svp-proto-slot {
    --at-apply: 'mb-0 ml-3 flex-grow min-w-0 py-1 px-2';
  }
</style>
