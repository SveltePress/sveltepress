<script lang="ts">
  interface Props {
    tone: 'quiet' | 'chip' | 'primary' | 'dock'
    playgroundPath: string
  }

  const { tone, playgroundPath }: Props = $props()

  let flashed = $state(false)
  let flashTimer: number | undefined

  function ignore(event: Event) {
    event.preventDefault()
    event.stopPropagation()
    flashed = true
    window.clearTimeout(flashTimer)
    flashTimer = window.setTimeout(() => {
      flashed = false
    }, 1600)
  }
</script>

<button
  type="button"
  class="cta tone-{tone}"
  data-svp-proto-cta
  aria-label="Open in Playground (prototype, does not navigate)"
  onclick={ignore}
>
  <span class="icon" aria-hidden="true">
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        stroke-width="1.75"
      />
      <path d="M10 9.5v5l4.5-2.5L10 9.5Z" fill="currentColor" />
    </svg>
  </span>
  <span class="label">Open in Playground</span>
</button>
{#if flashed}
  <div class="flash" role="status">
    Prototype — does not open {playgroundPath}
  </div>
{/if}

<style>
  .cta {
    --at-apply: 'inline-flex items-center gap-1.5 cursor-pointer font-500 select-none';
    font-family: inherit;
  }
  .icon {
    --at-apply: 'flex items-center text-[1.05em]';
  }
  .tone-quiet {
    --at-apply: 'h-9 px-3 rounded-full text-[13px] bg-transparent text-svp-primary-deep dark:text-svp-primary b-1 b-solid b-svp-primary/35 dark:b-svp-primary/45 hover:bg-svp-primary/8';
  }
  .tone-chip {
    --at-apply: 'h-8 px-2.5 rounded-md text-[13px] bg-white/80 dark:bg-white/8 text-svp-primary-deep dark:text-svp-primary b-1 b-solid b-black/10 dark:b-white/14';
  }
  .tone-primary {
    --at-apply: 'h-11 px-5 rounded-full text-[14px] svp-gradient-bg text-white font-600 b-none hover:shadow-[0_4px_16px_rgba(225,29,72,0.35)]';
  }
  .tone-dock {
    --at-apply: 'h-10 px-4 rounded-full text-[13px] bg-[#18181b] dark:bg-white text-white dark:text-zinc-9 font-600 b-none';
  }
  .flash {
    --at-apply: 'mt-1 text-[11px] leading-tight text-zinc-5 dark:text-zinc-4';
  }
</style>
