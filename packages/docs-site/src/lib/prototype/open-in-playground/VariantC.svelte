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
    const content = document.querySelector(
      '.theme-default--page-layout .content',
    )
    if (!content) return null
    const title = content.querySelector('h1.page-title')
    let introEnd: Element | null = null
    if (title) {
      let node: Element | null = title.nextElementSibling
      while (node) {
        if (
          node.matches(
            'h2, h3, .svp-live-code--container, .svp-code-block-wrapper',
          )
        ) {
          break
        }
        introEnd = node
        node = node.nextElementSibling
      }
    }
    if (introEnd) return { el: introEnd, where: 'after' }
    if (title) return { el: title, where: 'after' }
    return { el: content, where: 'prepend' }
  }
</script>

{#if show}
  <aside
    class="callout"
    data-svp-proto-slot="C"
    use:mountAt={{ key: `C:${leaf.logicalPath}`, pick }}
  >
    <div class="copy">
      <strong>Try this in the Playground</strong>
      <p>
        Opens the {leaf.name} Entry as authored. Live code on this page stays frozen.
      </p>
    </div>
    <Cta tone="primary" playgroundPath={leaf.playgroundPath!} />
  </aside>
{/if}

<style>
  .callout {
    --at-apply: 'flex flex-col sm:flex-row sm:items-center gap-4 my-6 px-5 py-4 rounded-xl b-1 b-solid b-svp-primary/25 dark:b-svp-primary/30 bg-rose-50/70 dark:bg-rose-950/25';
  }
  .copy {
    --at-apply: 'flex-grow min-w-0';
  }
  .copy strong {
    --at-apply: 'block text-[15px] text-zinc-8 dark:text-zinc-1';
  }
  .copy p {
    --at-apply: 'm-0 mt-1 text-[13px] leading-5 text-zinc-6 dark:text-zinc-4';
  }
</style>
