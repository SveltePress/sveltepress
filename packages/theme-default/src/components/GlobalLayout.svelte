<script lang="ts">
import Navbar from './Navbar.svelte'
</script>

<main>
  Default theme global layout
  <Navbar />
  <hr>
  <slot />
</main>

<style>
  :global(body) {
    --at-apply: bg-gray-1;
	}
</style>