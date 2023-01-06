<script lang="ts">
import pages from 'sveltepress:pages'
import Navbar from './Navbar.svelte'

console.log(pages)
</script>

<main>
  Default theme global layout
  <Navbar />
  <slot />
</main>

<style>
  :global(body) {
    --at-apply: bg-gray-1;
	}
</style>