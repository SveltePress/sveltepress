<script>
  import { onMount, tick } from 'svelte'
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

  const toggle = evt => {
    localStorage.setItem(key, isDark ? 'off' : 'on')
    const isAppearanceTransition =
      document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isAppearanceTransition) {
      isDark = !isDark
      return
    }

    const x = evt.clientX
    const y = evt.clientY
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )
    const transition = document.startViewTransition(async () => {
      isDark = !isDark
      await tick()
      addOrRemoveClass()
    })
    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 400,
          easing: isDark ? 'ease-out' : 'ease-in',
          pseudoElement: isDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        }
      )
    })
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
  const themeColor = JSON.parse('${JSON.stringify(themeColor)}')
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
    --at-apply: 'h-[28px] text-[24px] cursor-pointer px-3 flex items-center h-100% hover:opacity-80 relative';
  }
</style>
