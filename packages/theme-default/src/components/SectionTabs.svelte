<script lang="ts">
  import { page } from '$app/state'
  import {
    resolveVersionContext,
    resolveVersionedPath,
  } from 'virtual:sveltepress/versions'
  import External from './icons/External.svelte'
  import {
    resolveLocaleLink,
    resolveLocaleOptions,
    resolveLogicalRoute,
  } from './locale'
  import {
    isExternalSectionTabLink,
    resolveActiveSectionTab,
    resolveSectionTabIcon,
  } from './section-tabs'
  import { getPathFromBase } from './utils'

  interface Props {
    /** `bar` is the desktop row under the navbar; `list` sits in the mobile sidebar drawer. */
    variant?: 'bar' | 'list'
  }

  const { variant = 'bar' }: Props = $props()

  const localeOptions = $derived(resolveLocaleOptions(page.url.pathname))
  const tabs = $derived(localeOptions.sectionTabs ?? [])
  const linkVersionContext = $derived(resolveVersionContext(page.url.pathname))
  // Same logical route the sidebar resolves against: historical routes drop
  // their locale+version base, current routes drop the locale prefix.
  const logicalPath = $derived.by(() => {
    const routeId = page.route.id ?? ''
    const context = resolveVersionContext(routeId)
    return context?.historical
      ? context.logicalPath
      : resolveLogicalRoute(routeId)
  })
  const activeIndex = $derived(
    resolveActiveSectionTab(tabs, logicalPath, localeOptions.sidebar),
  )

  function resolveHref(to: string) {
    if (isExternalSectionTabLink(to)) return to
    return getPathFromBase(
      resolveVersionedPath(
        resolveLocaleLink(to, page.url.pathname),
        linkVersionContext,
      ),
    )
  }
</script>

{#if tabs.length}
  <nav
    class="section-tabs"
    class:section-tabs--list={variant === 'list'}
    aria-label={localeOptions.i18n?.sectionTabsLabel ?? 'Sections'}
  >
    {#each tabs as tab, index (index)}
      {@const external = isExternalSectionTabLink(tab.to)}
      {@const icon = resolveSectionTabIcon(tab.icon)}
      {@const active = index === activeIndex}
      <a
        class="section-tab"
        class:active
        href={resolveHref(tab.to)}
        aria-current={active ? 'true' : undefined}
        {...external ? { target: '_blank', rel: 'noreferrer' } : {}}
      >
        {#if icon?.type === 'iconify'}
          <span class="section-tab-icon {icon.className}" aria-hidden="true"
          ></span>
        {:else if icon}
          <span class="section-tab-icon" aria-hidden="true">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html icon.html}
          </span>
        {/if}
        <span class="section-tab-title">{tab.title}</span>
        {#if external}
          <External />
        {/if}
      </a>
    {/each}
  </nav>
{/if}

<style>
  .section-tabs {
    --at-apply: 'flex items-stretch gap-6 h-full overflow-x-auto';
    scrollbar-width: none;
  }
  .section-tabs::-webkit-scrollbar {
    display: none;
  }
  .section-tab {
    --at-apply: 'relative flex flex-none items-center gap-2 text-[14px] leading-5 font-500 whitespace-nowrap text-zinc-6 dark:text-zinc-4 hover:text-zinc-9 dark:hover:text-zinc-1 transition-colors transition-150';
  }
  .section-tab:focus-visible {
    --at-apply: 'outline outline-2 outline-offset-[-2px] outline-svp-primary rounded';
  }
  .section-tab.active {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary hover:text-svp-primary-deep dark:hover:text-svp-primary';
  }
  /* Sits on the header's bottom edge, like the active navbar item. */
  .section-tab.active::after {
    --at-apply: 'absolute left-0 right-0 bottom-0 h-[2px] rounded-full bg-current';
    content: '';
  }
  .section-tab-icon {
    --at-apply: 'flex-none inline-flex items-center justify-center w-[18px] h-[18px] text-[18px]';
  }
  .section-tab-icon :global(svg) {
    --at-apply: 'w-full h-full';
  }

  .section-tabs--list {
    --at-apply: 'flex-col gap-px h-auto overflow-visible';
  }
  .section-tabs--list .section-tab {
    --at-apply: 'px-3 py-2 rounded-md text-zinc-7 dark:text-zinc-3';
  }
  .section-tabs--list .section-tab:not(.active):hover {
    --at-apply: 'bg-black/4 dark:bg-white/6';
  }
  .section-tabs--list .section-tab.active {
    --at-apply: 'bg-svp-primary/8 dark:bg-svp-primary/12 text-svp-primary-deep dark:text-svp-primary font-600';
  }
  .section-tabs--list .section-tab.active::after {
    display: none;
  }
</style>
