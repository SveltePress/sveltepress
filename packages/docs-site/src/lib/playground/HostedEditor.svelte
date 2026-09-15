<script lang="ts">
  import type { CatalogLocale, Entry } from './catalog.ts'
  import type { HostedEditorEmbed, HostedEditorTheme } from './hosted-editor.ts'
  import { onMount } from 'svelte'
  import { openInStackBlitzUrl } from './catalog.ts'
  import { playgroundCopy } from './copy.ts'
  import { hostedEditorEmbedRequest } from './hosted-editor.ts'

  let {
    entry,
    locale,
    theme,
    embed,
  }: {
    entry: Entry
    locale: CatalogLocale
    theme?: HostedEditorTheme
    embed?: HostedEditorEmbed
  } = $props()

  const copy = $derived(playgroundCopy(locale))
  const forkHref = $derived(openInStackBlitzUrl(entry))

  let wrap = $state<HTMLDivElement | undefined>()
  let host = $state<HTMLDivElement | undefined>()
  let status = $state<'loading' | 'ready' | 'failed'>('loading')

  function resolveTheme(): HostedEditorTheme {
    if (theme) return theme
    if (typeof document === 'undefined') return 'light'
    return document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light'
  }

  onMount(() => {
    const node = host
    if (!node) return

    const request = hostedEditorEmbedRequest(entry, resolveTheme(), locale)
    let cancelled = false
    void (async () => {
      const embedFn = embed ?? (await import('./embed.ts')).embedGithubProject
      try {
        await embedFn(node, request.projectPath, request.options)
        if (!cancelled) status = 'ready'
      } catch {
        if (!cancelled) status = 'failed'
      }
    })()

    return () => {
      cancelled = true
      wrap?.querySelector('iframe')?.remove()
    }
  })
</script>

<section
  class="stage"
  data-pagefind-ignore="all"
  aria-label={copy.hostedEditor}
  aria-busy={status === 'loading'}
>
  {#if status === 'failed'}
    <div class="failed">
      <p class="failed-title">{copy.failedTitle}</p>
      <p class="failed-copy">{copy.failedCopy}</p>
      <a class="failed-cta" href={forkHref} target="_blank" rel="noreferrer">
        {copy.openInStackBlitz}
      </a>
    </div>
  {:else}
    <div class="embed-wrap" bind:this={wrap}>
      {#if status === 'loading'}
        <div class="stub">
          <p class="status">{copy.loading}</p>
          <p class="status-sub">{copy.loadingSub}</p>
        </div>
      {/if}
      <div class="embed-host" bind:this={host}></div>
    </div>
  {/if}
</section>

<style>
  .stage {
    --at-apply: 'relative flex flex-col min-h-0 min-w-0 flex-1 bg-[#1f1f23] text-zinc-3';
  }
  .embed-wrap {
    --at-apply: 'relative flex-1 min-h-[16rem] min-w-0';
  }
  .embed-host {
    --at-apply: 'absolute inset-0 min-h-[16rem]';
  }
  .embed-wrap :global(iframe) {
    width: 100%;
    height: 100%;
    border: 0;
    position: absolute;
    inset: 0;
  }
  .stub {
    --at-apply: 'absolute inset-0 z-1 flex flex-col justify-center px-6 py-10 bg-[#1f1f23]';
  }
  .status {
    --at-apply: 'm-0 text-[14px] font-600 text-zinc-2';
  }
  .status-sub {
    --at-apply: 'm-0 mt-1 text-[12px] text-zinc-5 leading-5';
  }
  .failed {
    --at-apply: 'flex-1 flex flex-col items-start justify-center gap-3 px-6 py-10 min-h-[16rem]';
  }
  .failed-title {
    --at-apply: 'm-0 text-[18px] font-700 text-zinc-1';
  }
  .failed-copy {
    --at-apply: 'm-0 max-w-[36rem] text-[13px] leading-6 text-zinc-4';
  }
  .failed-cta {
    --at-apply: 'inline-flex items-center h-10 px-4 rounded-full bg-white text-[#18181b] font-600 text-[13px] no-underline';
  }
</style>
