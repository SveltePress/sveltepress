<script lang="ts">
  const {
    command = 'pnpm create sveltepress',
    packageManager = 'pnpm',
  }: {
    command?: string
    packageManager?: string
  } = $props()

  let copied = $state(false)
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  async function handleCopy() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(command)
        copied = true
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          copied = false
        }, 2000)
      }
    } catch {
      // ignore clipboard errors gracefully
    }
  }
</script>

<div class="install-command" data-package-manager={packageManager}>
  <div class="command-content">
    <span class="prompt" aria-hidden="true">$</span>
    <span class="command-text">{command}</span>
  </div>
  <button
    type="button"
    class="copy-btn"
    class:copied
    onclick={handleCopy}
    aria-label={copied ? 'Copied' : 'Copy install command'}
    title={copied ? 'Copied!' : 'Copy to clipboard'}
  >
    {#if copied}
      <svg
        class="icon check-icon"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span class="copy-label">Copied</span>
    {:else}
      <svg
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
        ></path>
      </svg>
      <span class="copy-label">Copy</span>
    {/if}
  </button>
</div>

<style>
  .install-command {
    --at-apply: 'inline-flex items-center justify-between gap-3 max-w-full rounded-xl px-4 py-2.5 bg-zinc-1/80 dark:bg-[#18181b]/80 b-1 b-solid b-black/8 dark:b-white/10 backdrop-blur-md transition-all duration-200';
    font-family: var(--svp-code-font);
    box-shadow: 0 2px 8px -2px rgb(0 0 0 / 0.04);
  }

  .install-command:hover {
    --at-apply: 'b-black/15 dark:b-white/18 shadow-md';
  }

  .command-content {
    --at-apply: 'flex items-center gap-2 overflow-x-auto select-all';
  }

  .prompt {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary font-700 select-none opacity-80';
  }

  .command-text {
    --at-apply: 'text-13px sm:text-14px font-500 text-zinc-8 dark:text-zinc-2 whitespace-nowrap';
  }

  .copy-btn {
    --at-apply: 'inline-flex items-center gap-1.5 px-2.5 py-1 text-12px rounded-lg b-none bg-black/5 dark:bg-white/8 hover:bg-black/10 dark:hover:bg-white/14 text-zinc-6 dark:text-zinc-3 hover:text-zinc-9 dark:hover:text-zinc-1 cursor-pointer transition-all duration-200 select-none shrink-0';
  }

  .copy-btn.copied {
    --at-apply: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
  }

  .icon {
    --at-apply: 'w-3.5 h-3.5';
  }

  .check-icon {
    --at-apply: 'text-emerald-600 dark:text-emerald-400';
  }

  .copy-label {
    --at-apply: 'hidden sm:inline font-sans text-11px font-500';
  }
</style>
