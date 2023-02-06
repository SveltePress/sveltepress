<script>
  import Moon from './icons/Moon.svelte'
  import Sun from './icons/Sun.svelte'

  const key = 'SVELTEPRESS_DARK_MODE'

  let isDark = false

  const addOrRemoveClass = () => {
    if (isDark) document.querySelector('html').classList.add('dark')
    else document.querySelector('html').classList.remove('dark')
  }

  const toggle = () => {
    localStorage.setItem(key, isDark ? 'off' : 'on')
    isDark = !isDark
    addOrRemoveClass()
  }
</script>

<svelte:head>
  {@html `<script>
  if(window.localStorage.getItem('${key}') === 'on') {
    document.querySelector('html').classList.add('dark')
  } else {
    document.querySelector('html').classList.remove('dark')
  }
</script>`}
</svelte:head>

<div class="toggle" on:click={toggle} on:keyup={toggle}>
  {#if isDark}
    <Moon />
  {:else}
    <Sun />
  {/if}
</div>

<style>
  .toggle {
    --at-apply: 'h-[28px] text-[24px] cursor-pointer px-3 flex items-center h-100% hover:opacity-80';
  }
</style>
