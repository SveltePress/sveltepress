<script>
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import IconifyIcon from '../IconifyIcon.svelte'
  import External from '../icons/External.svelte'
  import { resolveLocaleLink } from '../locale'
  import { getPathFromBase } from '../utils'

  /**
   * @typedef {object} Props
   * @property {any} i Index of the feature card
   * @property {any} title Title of the feature card
   * @property {any} description Description of the feature card
   * @property {any} [link] Link to navigate to when the card is clicked
   * @property {(e: any) => any} [onkeypress] Function to call when the card is pressed
   * @property {import('./types').CustomIcon} [icon] Custom icon to display in the card
   */

  /** @type {Props} */
  const {
    onkeypress = undefined,
    title,
    description,
    link = undefined,
    icon = undefined,
  } = $props()

  const external = $derived(/^https?/.test(link))
  const resolvedLink = $derived(
    !link || external
      ? link
      : getPathFromBase(resolveLocaleLink(link, page.url.pathname)),
  )

  function handleFeatureCardClick() {
    if (!resolvedLink) return
    if (external) window.open(resolvedLink, '_blank')
    else goto(resolvedLink)
  }

  function handleKeyDown(e) {
    if (onkeypress) {
      onkeypress(e)
    }
    if ((e.key === 'Enter' || e.key === ' ') && link) {
      e.preventDefault()
      handleFeatureCardClick()
    }
  }
</script>

{#snippet cardContent()}
  <div class="feature-header">
    {#if icon?.type}
      <div class="icon">
        {#if icon.type === 'svg'}
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html icon.value}
        {:else if icon.type === 'iconify'}
          <IconifyIcon {...icon} />
        {/if}
      </div>
    {:else}
      <div></div>
    {/if}

    {#if external}
      <div class="feature-badge" aria-hidden="true">
        <External />
      </div>
    {:else if link}
      <div class="feature-badge arrow" aria-hidden="true">
        <svg
          class="arrow-icon"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 14L14 6" />
          <path d="M8 6h6v6" />
        </svg>
      </div>
    {/if}
  </div>

  <div class="feature-title">
    {title}
  </div>
  <div class="feature-desc">
    {description}
  </div>
{/snippet}

{#if link}
  <div
    class="feature-item clickable"
    onclick={handleFeatureCardClick}
    onkeydown={handleKeyDown}
    role="link"
    tabindex="0"
  >
    {@render cardContent()}
  </div>
{:else}
  <div class="feature-item">
    {@render cardContent()}
  </div>
{/if}

<style>
  .feature-item {
    --at-apply: 'relative flex flex-col h-full bg-white/80 dark:bg-[#1f1f23]/80 backdrop-blur-sm p-6 rounded-2xl b-1 b-solid b-black/6 dark:b-white/8 transition-all duration-300 select-none';
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  }

  .clickable {
    --at-apply: 'cursor-pointer';
  }

  .clickable:hover {
    --at-apply: 'b-svp-primary/40 dark:b-svp-primary/40 -translate-y-1';
    box-shadow:
      0 12px 24px -10px rgb(0 0 0 / 0.08),
      0 4px 6px -4px rgb(0 0 0 / 0.04);
  }

  :global(.dark) .clickable:hover {
    box-shadow:
      0 14px 28px -10px rgb(0 0 0 / 0.5),
      0 0 24px -4px rgb(251 113 133 / 0.08);
  }

  .feature-header {
    --at-apply: 'flex items-center justify-between w-full mb-4';
  }

  .icon {
    --at-apply: 'text-7 w-12 h-12 inline-flex items-center justify-center bg-black/4 dark:bg-white/6 b-1 b-solid b-black/4 dark:b-white/6 rounded-xl transition-colors duration-300';
  }

  .clickable:hover .icon {
    --at-apply: 'bg-svp-primary/10 b-svp-primary/20 text-svp-primary-deep dark:text-svp-primary';
  }

  .feature-badge {
    --at-apply: 'text-zinc-4 dark:text-zinc-5 text-4 transition-all duration-300';
  }

  .arrow {
    --at-apply: 'opacity-40';
  }

  .arrow-icon {
    --at-apply: 'w-4 h-4';
  }

  .clickable:hover .feature-badge {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary opacity-100';
  }

  .clickable:hover .arrow-icon {
    transform: translate(2px, -2px);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .feature-title {
    --at-apply: 'text-base sm:text-lg font-600 text-zinc-9 dark:text-zinc-1 transition-colors duration-200 tracking-[-0.01em] leading-snug';
  }

  .clickable:hover .feature-title {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary';
  }

  .feature-desc {
    --at-apply: 'text-zinc-6 dark:text-zinc-4 mt-2.5 text-[14px] leading-relaxed flex-grow';
  }
</style>
