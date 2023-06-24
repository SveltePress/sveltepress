<script>
  import themeOption from 'virtual:sveltepress/theme-default'

  const ga = themeOption.ga
</script>

<svelte:head>
  {#if ga}
    {@html `<script async src="${`https://www.googletagmanager.com/gtag/js?id=${ga}`}"></script>
    <script>
      window.dataLayer = window.dataLayer || []
      function gtag() {
        // eslint-disable-next-line prefer-rest-params, no-undef
        dataLayer.push(arguments)
      }
      gtag('js', new Date())

      // eslint-disable-next-line no-template-curly-in-string
      gtag('config', '${ga}')
    </script>`}
  {/if}
</svelte:head>
