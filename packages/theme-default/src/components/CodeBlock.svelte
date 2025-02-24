<script>
  import { onMount } from 'svelte'
  import themeOptions from 'virtual:sveltepress/theme-default'

  /**
   * @typedef {object} Props
   * @property {string} [code] - The code value
   * @property {string} [lang] - The language of the code
   */

  /** @type {Props} */
  let { code = '', lang } = $props()

  let highlightedCode = $state('')

  async function loadShikiAndHighlight() {
    const { codeToHtml } = await import('shiki')
    highlightedCode = await codeToHtml(code, {
      lang,
      themes: {
        dark: themeOptions.highlighter.themeDark ?? 'night-owl',
        light: themeOptions.highlighter.themeDark ?? 'vitesse-light',
      },
    })
  }

  onMount(() => {
    loadShikiAndHighlight()
  })
</script>

<div>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html highlightedCode}
</div>
