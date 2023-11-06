<script>
  import themOptions from 'virtual:sveltepress/theme-default'
  import Prev from './icons/Prev.svelte'
  import Next from './icons/Next.svelte'
  import { pages } from './layout'
  import { page } from '$app/stores'
  import { base } from '$app/paths'

  const routeId = $page.route.id

  const activeIdx = $pages.findIndex(p =>
    routeId.endsWith('/') ? p.to === routeId : p.to.startsWith(routeId),
  )
  const hasActivePage = activeIdx !== -1
  const hasPrevPage = hasActivePage && activeIdx > 0
  const hasNextPage = hasActivePage && activeIdx < $pages.length - 1

  const DEFAULT_PREVIOUS_TEXT = 'Previous'
  const DEFAULT_NEXT_TEXT = 'Next'
</script>

<div class="page-switcher">
  <div class:switcher={hasPrevPage}>
    {#if hasPrevPage}
      {@const prevPage = $pages[activeIdx - 1]}
      <a href={base + prevPage.to} class="trigger">
        <div class="hint">
          {themOptions.i18n?.previousPage || DEFAULT_PREVIOUS_TEXT}
        </div>
        <div class="title">
          <div class="switch-icon">
            <Prev />
          </div>
          <div class="title-label">
            {prevPage.title}
          </div>
        </div>
      </a>
    {/if}
  </div>
  <div class="right" class:switcher={hasNextPage}>
    {#if hasNextPage}
      {@const nextPage = $pages[activeIdx + 1]}
      <a href={base + nextPage.to} class="trigger">
        <div class="hint">
          {themOptions.i18n?.nextPage || DEFAULT_NEXT_TEXT}
        </div>
        <div class="title">
          <div class="title-label">
            {nextPage.title}
          </div>
          <div class="switch-icon">
            <Next />
          </div>
        </div>
      </a>
    {/if}
  </div>
</div>

<style>
  .page-switcher {
    --at-apply: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 border-t-solid border-t border-light-7 dark:border-gray-7 pt-4 sm:pt-8 mt-4';
  }
  .switcher {
    --at-apply: 'border-solid border-1 border-light-7 dark:border-gray-7 rounded-lg flex-grow cursor-pointer hover:border-svp-primary transition-300 transition-colors';
  }
  .hint {
    --at-apply: text-gray-4 text-3;
  }
  .title {
    --at-apply: flex items-center text-svp-primary mt-3;
  }
  .right .title {
    --at-apply: justify-end;
  }
  .title-label {
    --at-apply: ml-2;
  }
  .right .title-label {
    --at-apply: mr-2 ml-none;
  }
  .right {
    --at-apply: text-right;
  }
  .switch-icon {
    --at-apply: text-5;
  }
  .trigger {
    --at-apply: px-4 py-2 block;
  }
</style>
