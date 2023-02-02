<script>
  import Prev from './icons/Prev.svelte'
  import Next from './icons/Next.svelte'
  import { page } from '$app/stores'

  const routeId = $page.route.id
  export let pages = []

  const activeIdx = pages.findIndex(p =>
    routeId.endsWith('/') ? p.to === routeId : p.to.startsWith(routeId)
  )
  const hasActivePage = activeIdx !== -1
  const hasPrevPage = hasActivePage && activeIdx > 0
  const hasNextPage = hasActivePage && activeIdx < pages.length - 1
</script>

<div class="page-switcher">
  <div class:switcher={hasPrevPage}>
    {#if hasPrevPage}
      {@const prevPage = pages[activeIdx - 1]}
      <a href={prevPage.to}>
        <div class="hint">Previous</div>
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
      {@const nextPage = pages[activeIdx + 1]}
      <a href={nextPage.to}>
        <div class="hint">Next</div>
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
  --at-apply: grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8
    border-t-solid border-t border-light-7 dark:border-gray-7 
    pt-4 sm:pt-8 mt-4;
}
.switcher {
  --at-apply: border-solid border-1 border-light-7 dark:border-gray-7
    rounded-lg flex-grow px-4 py-2 cursor-pointer
    hover:border-rose-5 transition-300 transition-colors;
}
.hint {
  --at-apply: text-gray-4 text-3;
}
.title {
  --at-apply: flex items-center text-rose-4 mt-3;
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
</style>
