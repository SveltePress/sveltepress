<script>
  import { page } from '$app/state'
  import {
    resolveVersionContext,
    resolveVersionedPath,
  } from 'virtual:sveltepress/versions'
  import External from './icons/External.svelte'
  import { resolveLocaleLink } from './locale'
  import { getPathFromBase } from './utils'

  /**
   * @typedef {object} Props
   * @property {string} [label] - Link label
   * @property {string} [to] - Link URL
   * @property {boolean} [inline] - Whether the link is inline
   * @property {boolean} [active] - Whether the link is active
   * @property {boolean} [highlight] - Whether the link should be highlighted
   * @property {boolean} [withBase] - Whether the link should have the base URL
   * @property {boolean} [withLocale] - Whether the active locale should be applied
   * @property {boolean} [withVersion] - Whether the active documentation version should be applied
   * @property {string} [target] - Link target attribute (e.g., '_blank', '_self')
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
    withLocale = true,
    withVersion = true,
    target,
    pre,
    labelRenderer,
    children,
  } = $props()

  let isExternal = $derived(/^https?|mailto:/.test(to))
  let versionContext = $derived(resolveVersionContext(page.url.pathname))
  let localizedTo = $derived(
    withLocale ? resolveLocaleLink(to, page.url.pathname) : to,
  )
  let versionedTo = $derived(
    withVersion
      ? resolveVersionedPath(localizedTo, versionContext)
      : localizedTo,
  )
  let toWithBase = $derived(isExternal ? to : getPathFromBase(versionedTo))
</script>

<a
  href={withBase ? toWithBase : to}
  class="link"
  class:no-inline={!inline}
  class:active
  class:highlight
  {...target ? { target } : isExternal ? { target: '_blank' } : {}}
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
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary font-500';
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
    text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
    transition: text-decoration-color 0.2s;
  }
  .highlight:hover {
    text-decoration-color: currentColor;
  }
  .link {
    --at-apply: 'inline-flex hover:text-svp-hover cursor-pointer items-center transition-200 transition-color';
  }
  .link.no-inline {
    --at-apply: 'flex';
  }
  .active {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary hover:text-svp-primary-deep dark:hover:text-svp-primary font-600 cursor-default';
  }
</style>
