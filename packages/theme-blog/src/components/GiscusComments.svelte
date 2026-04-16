<!-- Mounts Giscus on first render. Listens to <html data-theme> changes and
     postMessages the corresponding giscus theme to the iframe. -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { blogConfig } from 'virtual:sveltepress/blog-config'

  let container: HTMLElement | undefined = $state()

  function giscusTheme(mode: string | undefined): string {
    return mode === 'light' ? 'light' : 'dark_dimmed'
  }

  onMount(() => {
    const cfg = blogConfig.giscus
    if (!cfg || !container) return

    const s = document.createElement('script')
    s.src = 'https://giscus.app/client.js'
    s.async = true
    s.crossOrigin = 'anonymous'
    s.setAttribute('data-repo', cfg.repo)
    s.setAttribute('data-repo-id', cfg.repoId)
    s.setAttribute('data-category', cfg.category)
    s.setAttribute('data-category-id', cfg.categoryId)
    s.setAttribute('data-mapping', cfg.mapping ?? 'pathname')
    s.setAttribute('data-strict', '0')
    s.setAttribute(
      'data-reactions-enabled',
      cfg.reactionsEnabled === false ? '0' : '1',
    )
    s.setAttribute('data-emit-metadata', '0')
    s.setAttribute('data-input-position', cfg.inputPosition ?? 'bottom')
    s.setAttribute(
      'data-theme',
      giscusTheme(document.documentElement.dataset.theme),
    )
    s.setAttribute('data-lang', cfg.lang ?? 'en')
    container.appendChild(s)

    const obs = new MutationObserver(() => {
      const iframe = container?.querySelector<HTMLIFrameElement>(
        'iframe.giscus-frame',
      )
      iframe?.contentWindow?.postMessage(
        {
          giscus: {
            setConfig: {
              theme: giscusTheme(document.documentElement.dataset.theme),
            },
          },
        },
        'https://giscus.app',
      )
    })
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => obs.disconnect()
  })
</script>

{#if blogConfig.giscus}
  <section
    class="sp-giscus"
    aria-label="Comments"
    bind:this={container}
  ></section>
{/if}

<style>
  .sp-giscus {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--sp-blog-border);
  }
</style>
