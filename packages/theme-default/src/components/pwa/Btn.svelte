<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let flat = false

  const dispatcher = createEventDispatcher()

  const handleClick = () => {
    dispatcher('click')
  }
</script>

<div
  role="button"
  class="btn"
  class:primary={!flat}
  class:flat={flat}
  on:click={handleClick}
  on:keyup={handleClick}
>
  <slot />
</div>

<style>
  .btn {
    --at-apply: 'ml-2 px-4 leading-8 inline-flex items-center cursor-pointer transition-bg bg-transparent transition-300 rounded';
  }
  .primary {
    --at-apply: 'bg-rose-5 text-gray-2 hover:bg-rose-6 dark:hover-bg-rose-4';
  }
  .flat {
    --at-apply: 'text-gray-8 hover:bg-gray-2  dark:text-gray-2 dark:hover:bg-gray-9';
  }
</style>
