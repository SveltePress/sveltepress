<script>
  import External from './icons/External.svelte'
  import { getPathFromBase } from './utils'

  /**
   * @typedef {object} Props
   * @property {string} [label] - Link label
   * @property {string} [to] - Link URL
   * @property {boolean} [inline] - Whether the link is inline
   * @property {boolean} [active] - Whether the link is active
   * @property {boolean} [highlight] - Whether the link should be highlighted
   * @property {boolean} [withBase] - Whether the link should have the base URL
   * @property {import('svelte').Snippet} [labelRenderer] - Prepend content
   * @property {import('svelte').Snippet} [pre] - Prepend content
   * @property {import('svelte').Snippet} [children] - Children content
   */

  /** @type {Props} */
  const {
    label = '',
    to = '',
    inline = true,
    active = false,
    highlight = true,
    withBase = true,
    pre,
    labelRenderer,
    children,
  } = $props()

  let isExternal = $derived(/^https?|mailto:/.test(to))
  let toWithBase = $derived(isExternal ? to : getPathFromBase(to))
</script>

<a
  href={withBase ? toWithBase : to}
  class="link"
  class:no-inline={!inline}
  class:active
  class:highlight
  {...isExternal ? { target: '_blank' } : {}}
  aria-label={label}
>
  {@render pre?.()}
  {#if labelRenderer}
    {@render labelRenderer?.()}
  {:else}
    <span>
      {label}
    </span>
  {/if}
  {#if isExternal}
    <External />
  {/if}
  {@render children?.()}
</a>

<style>
  .highlight {
    --at-apply: 'text-svp-primary';
  }
  .link {
    --at-apply: 'inline-flex hover:text-svp-hover cursor-pointer items-center transition-200 transition-color';
  }
  .link.no-inline {
    --at-apply: 'flex';
  }
  .active {
    --at-apply: 'svp-gradient-text hover:svp-gradient-text cursor-default';
  }
</style>
