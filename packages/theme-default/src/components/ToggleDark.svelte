<script>
  import { onMount } from 'svelte'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Moon from './icons/Moon.svelte'
  import Sun from './icons/Sun.svelte'

  const key = 'SVELTEPRESS_DARK_MODE'

  let isDark = false
  const themeColor = themeOptions.themeColor || { light: '#fff', dark: '#000' }
  const addOrRemoveClass = () => {
    if (isDark) {
      document.querySelector('html').classList.add('dark')
      if (themeColor) {
        document
          .getElementById('theme-color')
          .setAttribute('content', themeColor.dark)
      }
    } else {
      document.querySelector('html').classList.remove('dark')
      if (themeColor) {
        document
          .getElementById('theme-color')
          .setAttribute('content', themeColor.light)
      }
    }
  }

  const toggle = () => {
    localStorage.setItem(key, isDark ? 'off' : 'on')
    isDark = !isDark
    addOrRemoveClass()
  }
  onMount(() => {
    isDark = localStorage.getItem(key) === 'on'
    addOrRemoveClass()
  })
</script>

<svelte:head>
  <meta
    id="theme-color"
    name="theme-color"
    content={themeColor.light || '#fff'}
  />
  {@html `
<script>
  const themeColor = JSON.parse('${JSON.stringify(themeOptions.themeColor)}')
  if(window.localStorage.getItem('${key}') === 'on') {
    document.querySelector('html').classList.add('dark')
    document.getElementById('theme-color').setAttribute('content', themeColor ? themeColor.dark : '#ffffff')
  } else {
    document.querySelector('html').classList.remove('dark')
    document.getElementById('theme-color').setAttribute('content', themeColor ? themeColor.light : '#ffffff')
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
