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
    const title = document.querySelector(
      '.theme-default--page-layout h1.page-title',
    )
    if (!title) return null
    return {
      el: title,
      where: 'append',
      decorate(el) {
        const previous = (el as HTMLElement).style.display
        ;(el as HTMLElement).style.display = 'flex'
        ;(el as HTMLElement).style.alignItems = 'center'
        ;(el as HTMLElement).style.flexWrap = 'wrap'
        ;(el as HTMLElement).style.gap = '0.75rem'
        return () => {
          ;(el as HTMLElement).style.display = previous
          ;(el as HTMLElement).style.alignItems = ''
          ;(el as HTMLElement).style.flexWrap = ''
          ;(el as HTMLElement).style.gap = ''
        }
      },
    }
  }
</script>

{#if show}
  <div
    class="svp-proto-slot"
    data-svp-proto-slot="A"
    use:mountAt={{ key: `A:${leaf.logicalPath}`, pick }}
  >
    <Cta tone="quiet" playgroundPath={leaf.playgroundPath!} />
  </div>
{/if}

<style>
  .svp-proto-slot {
    --at-apply: 'inline-flex items-center ml-auto';
  }
  @media (max-width: 949px) {
    .svp-proto-slot {
      --at-apply: 'w-full ml-0 mt-1';
    }
  }
</style>
