<script>
  import { page } from '$app/stores'
  const routeId = $page.route.id

  export let pages = []

  const activeIdx = pages.findIndex(p => routeId.endsWith('/') ? p.to === routeId : p.to.startsWith(routeId))
  const hasActivePage = activeIdx !== -1
  const hasPrevPage = hasActivePage && activeIdx > 0
  const hasNextPage = hasActivePage && activeIdx < pages.length - 1
</script>

<div class="page-switcher">
  <div class:switcher={hasPrevPage}>
    {#if hasPrevPage}
      {@const prevPage = pages[activeIdx - 1]}
      <a href={prevPage.to}>
        <div class="hint">
          Prev
        </div>
        <div class="text-rose-4">
          {pages[activeIdx - 1].title}
        </div>
      </a>
    {/if}
  </div>
  <div class="text-right" class:switcher={hasNextPage}>
    {#if hasNextPage}
      {@const nextPage = pages[activeIdx + 1]}
      <a href={nextPage.to}>
        <div class="hint">
          Next
        </div>
        <div class="text-rose-4">
          {nextPage.title}
        </div>
      </a>
    {/if}
    </div>
</div>

<style>
.page-switcher {
  --at-apply: grid grid-cols-2 gap-8
    border-t-solid border-t border-light-7 dark:border-gray-7 
    pt-8 mt-8;
}
.switcher {
  --at-apply: border-solid border-1 border-light-7 dark:border-gray-7
    rounded-lg flex-grow px-4 py-2 cursor-pointer
    hover:border-rose-4 transition-300 transition-colors;
}
.hint {
  --at-apply: text-gray-4;
}
</style>