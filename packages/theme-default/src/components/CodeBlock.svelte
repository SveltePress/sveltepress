<script>
  import { onMount } from 'svelte'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import { resolveShikiThemes } from '../shiki-themes'

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
      themes: resolveShikiThemes(themeOptions.highlighter),
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
