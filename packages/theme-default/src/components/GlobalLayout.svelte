<script lang="ts">
import Navbar from './Navbar.svelte'
</script>

<main class="pt-[56px]">
  <Navbar />
  <slot />
</main>

<style>
  :global(body) {
    --at-apply: bg-gray-1 text-[#323232] dark:text-[#cecece];
	}
  :global(a) {
    color: inherit;
  }
</style>