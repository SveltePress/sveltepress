<script lang="ts">
import Navbar from './Navbar.svelte'
</script>

<main>
  GlobalLayout
  <Navbar />
  <slot />
</main>

<style>
  :global(body) {
    --at-apply: bg-gray-1;
	}
</style>