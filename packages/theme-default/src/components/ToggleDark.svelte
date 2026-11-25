<script>
  import { browser } from '$app/env'
  import { onMount, tick } from 'svelte'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import Moon from './icons/Moon.svelte'
  import Sun from './icons/Sun.svelte'
  import SystemDefault from './icons/SystemDefault.svelte'
  import { darkMode, isDark } from './layout'

  const key = 'SVELTEPRESS_DARK_MODE'
  const darkQuery = '(prefers-color-scheme: dark)'
  const nextMode = { light: 'dark', dark: 'auto', auto: 'light' }

  const themeColor = {
    light: themeOptions.themeColor?.light || '#fff',
    dark: themeOptions.themeColor?.dark || '#000',
  }

  // Anything stored other than an explicit light or dark choice, including
  // nothing at all on a first visit, means "follow the system".
  function normalizeMode(stored) {
    return stored === 'light' || stored === 'dark' ? stored : 'auto'
  }

  function resolveDark(mode) {
    return (
      mode === 'dark' ||
      (mode === 'auto' && window.matchMedia(darkQuery).matches)
    )
  }

  function applyAppearance() {
    localStorage.setItem(key, $darkMode)
    document.documentElement.classList.toggle('dark', $isDark)
    document
      .getElementById('theme-color')
      ?.setAttribute('content', $isDark ? themeColor.dark : themeColor.light)
  }

  function toggle(evt) {
    const wasDark = $isDark
    $darkMode = nextMode[$darkMode] ?? 'light'
    $isDark = resolveDark($darkMode)

    const animate =
      document.startViewTransition &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      $isDark !== wasDark

    if (!animate) {
      applyAppearance()
      return
    }

    // A keyboard activation carries no pointer position, so the reveal
    // starts from the control itself.
    const rect = evt.currentTarget.getBoundingClientRect()
    const fromKeyboard = evt.detail === 0
    const x = fromKeyboard ? rect.left + rect.width / 2 : evt.clientX
    const y = fromKeyboard ? rect.top + rect.height / 2 : evt.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )
    const transition = document.startViewTransition(async () => {
      await tick()
      applyAppearance()
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
      $isDark = e.matches
      applyAppearance()
    }
  }

  let mediaQuery

  if (browser) {
    mediaQuery = window.matchMedia(darkQuery)
    $darkMode = normalizeMode(window.localStorage.getItem(key))
    $isDark = resolveDark($darkMode)
    applyAppearance()
  }
  onMount(() => {
    mediaQuery?.addEventListener('change', handleColorSchemeChange)

    return () => {
      mediaQuery?.removeEventListener('change', handleColorSchemeChange)
    }
  })

  // Runs before the bundle loads, so the first paint already has the right
  // colours. It has to agree with normalizeMode and resolveDark above.
  const bootScript = `(function () {
  var themeColor = ${JSON.stringify(themeColor).replace(/</g, '\\u003c')}
  var stored = window.localStorage.getItem('${key}')
  var dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('${darkQuery}').matches)
  document.documentElement.classList.toggle('dark', dark)
  var meta = document.getElementById('theme-color')
  if (meta) meta.setAttribute('content', dark ? themeColor.dark : themeColor.light)
})()`
</script>

<svelte:head>
  <meta id="theme-color" name="theme-color" content={themeColor.light} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<${'script'}>${bootScript}</${'script'}>`}
</svelte:head>

<button
  type="button"
  class="toggle"
  aria-label="Toggle dark mode"
  onclick={toggle}
>
  {#if $darkMode === 'auto'}
    <SystemDefault />
  {:else if $darkMode === 'dark'}
    <Moon />
  {:else if $darkMode === 'light'}
    <Sun />
  {/if}
</button>

<style>
  .toggle {
    --at-apply: 'h-[28px] text-[24px] cursor-pointer px-3 py-0 flex items-center h-100% hover:opacity-80 relative bg-transparent b-0 text-inherit';
  }
</style>
