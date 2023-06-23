<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let flat = false

  const dispatcher = createEventDispatcher()

  function handleClick() {
    dispatcher('click')
  }
</script>

<div
  role="button"
  class="btn"
  class:primary={!flat}
  class:flat
  on:click={handleClick}
  on:keyup={handleClick}
  tabindex="0"
>
  <slot />
</div>

<style>
  .btn {
    --at-apply: 'ml-2 px-4 leading-9 inline-flex items-center cursor-pointer active:translate-y-[2px] translate-x-0 rounded select-none';
  }
  .primary {
    --at-apply: 'svp-gradient-bg text-gray-8 hover:shadow-lg';
  }
  .flat {
    --at-apply: 'text-gray-8 hover:bg-gray-3 dark:text-gray-2 dark:hover:bg-gray-8 bg-gray-1 dark:bg-gray-9';
  }
</style>
