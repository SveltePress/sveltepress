<script>
  import { browser } from '$app/environment'
  import { onMount, tick } from 'svelte'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Moon from './icons/Moon.svelte'
  import Sun from './icons/Sun.svelte'
  import SystemDefault from './icons/SystemDefault.svelte'
  import { darkMode, isDark } from './layout'

  const key = 'SVELTEPRESS_DARK_MODE'

  const themeColor = themeOptions.themeColor || { light: '#fff', dark: '#000' }
  function addOrRemoveClass() {
    localStorage.setItem(key, $darkMode)
    if ($isDark) {
      document.querySelector('html').classList.add('dark')
      if (themeColor) {
        document
          .getElementById('theme-color')
          ?.setAttribute('content', themeColor.dark)
      }
    } else {
      document.querySelector('html').classList.remove('dark')
      if (themeColor) {
        document
          .getElementById('theme-color')
          ?.setAttribute('content', themeColor.light)
      }
    }
  }

  function toggle(evt) {
    const isAppearanceTransition =
      document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isAppearanceTransition) {
      if (darkMode === 'light') {
        $darkMode = 'dark'
        $isDark = true
      } else if (darkMode === 'dark') {
        $darkMode = 'auto'
        $isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      } else if (darkMode === 'auto') {
        $darkMode = 'light'
        $isDark = false
      }
      addOrRemoveClass()
      return
    }

    const x = evt.clientX
    const y = evt.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )
    let needTransition = false
    if ($darkMode === 'light') {
      $darkMode = 'dark'
      $isDark = true
      needTransition = true
    } else if ($darkMode === 'dark') {
      $darkMode = 'auto'
      $isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      needTransition = !$isDark
    } else if ($darkMode === 'auto') {
      $darkMode = 'light'
      $isDark = false
      needTransition = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    if (!needTransition) {
      tick().then(addOrRemoveClass)
      return
    }
    const transition = document.startViewTransition(async () => {
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
          clipPath: $isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 400,
          easing: $isDark ? 'ease-out' : 'ease-in',
          pseudoElement: $isDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
  }

  function handleColorSchemeChange(e) {
    if ($darkMode === 'auto') {
      if (e.matches) {
        $isDark = true
      } else {
        $isDark = false
      }
      addOrRemoveClass()
    }
  }

  let mediaQuery

  if (browser) {
    let storedMode = window.localStorage.getItem(key)
    if (
      storedMode !== 'light' &&
      storedMode !== 'dark' &&
      storedMode !== 'auto'
    ) {
      storedMode = 'auto'
      window.localStorage.setItem(key, storedMode)
    }
    $darkMode = storedMode
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    handleColorSchemeChange(mediaQuery)
  }
  onMount(() => {
    mediaQuery?.addEventListener('change', handleColorSchemeChange)

    return () => {
      mediaQuery?.removeEventListener('change', handleColorSchemeChange)
    }
  })
</script>

<!-- eslint-disable no-template-curly-in-string -->

<svelte:head>
  <meta
    id="theme-color"
    name="theme-color"
    content={themeColor.light || '#fff'}
  />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `
<${'script'}>
  const themeColor = JSON.parse('${JSON.stringify(themeColor)}')
  const storedMode = window.localStorage.getItem('${key}')
  if (storedMode === 'dark' || (storedMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.querySelector('html').classList.add('dark')
    document.getElementById('theme-color')?.setAttribute('content', themeColor ? themeColor.dark : '#ffffff')
  }
  else {
    document.querySelector('html').classList.remove('dark')
    document.getElementById('theme-color')?.setAttribute('content', themeColor ? themeColor.light : '#ffffff')
  }
</${'script'}>`}
</svelte:head>

<div
  class="toggle"
  onclick={toggle}
  onkeyup={() => {}}
  aria-label="Toggle dark mode"
  role="button"
  tabindex="0"
>
  {#if $darkMode === 'auto'}
    <SystemDefault />
  {:else if $darkMode === 'dark'}
    <Moon />
  {:else if $darkMode === 'light'}
    <Sun />
  {/if}
</div>

<style>
  .toggle {
    --at-apply: 'h-[28px] text-[24px] cursor-pointer px-3 flex items-center h-100% hover:opacity-80 relative';
  }
</style>
