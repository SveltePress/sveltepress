<script>
  import themeOption from 'virtual:sveltepress/theme-default'

  const ga = themeOption.ga
</script>

<svelte:head>
  {#if ga}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html `<${'script'} async src="${`https://www.googletagmanager.com/gtag/js?id=${ga}`}"></${'script'}>
    <${'script'}>
      window.dataLayer = window.dataLayer || []
      function gtag() {
        dataLayer.push(arguments)
      }
      gtag('js', new Date())

      gtag('config', '${ga}')
  </${'script'}>
  `}
  {/if}
</svelte:head>
