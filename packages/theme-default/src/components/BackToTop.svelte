<script>
  import { scrollY } from './layout'
  import Up from './icons/Up.svelte'

  const scrollToTop = () => {
    $scrollY = 0
  }
</script>

<div
  class="back-to-top-trigger"
  class:show={$scrollY > 10}
  on:click={scrollToTop}
  on:keypress={scrollToTop}
>
  <Up />
</div>

<style>
  .back-to-top-trigger {
    --uno: 'sm:display-none fixed bottom-[12px] right-[12px] w-[42px] h-[42px] bg-white dark:shadow-gray-5 dark:bg-gray-9 rounded-[50%] shadow-md flex items-center justify-center text-6 transition-all transition-300 z-[890] opacity-0';
  }
  .show {
    --uno: 'opacity-100';
  }
</style>
