<script>
  import Moon from "./icons/Moon.svelte";
  import Sun from "./icons/Sun.svelte";

  const key = 'SVELTEPRESS_DARK_MODE'

  let isDark = localStorage.getItem(key) === 'on'

  const addOrRemoveClass = () => {
    if(isDark) {
      document.querySelector('html').classList.add('dark')
    } else {
      document.querySelector('html').classList.remove('dark')
    }
  }

  addOrRemoveClass()

  const toggle = () => {
    localStorage.setItem(key, isDark ? 'off' : 'on')
    isDark = !isDark
    addOrRemoveClass()
  }
</script>
<div class="toggle" on:click={toggle} on:keyup={toggle}>
  {#if isDark}
    <Moon />
  {:else}
    <Sun />
  {/if}
</div>

<style>
.toggle {
  --at-apply: h-[32px] text-[32px] cursor-pointer px-3 flex items-center h-100%;
}
</style>