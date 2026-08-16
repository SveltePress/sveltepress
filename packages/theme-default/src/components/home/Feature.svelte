<script>
  import { goto } from '$app/navigation'
  import IconifyIcon from '../IconifyIcon.svelte'
  import External from '../icons/External.svelte'

  /**
   * @typedef {object} Props
   * @property {any} i Index of the feature card
   * @property {any} title Title of the feature card
   * @property {any} description Description of the feature card
   * @property {any} [link] Link to navigate to when the card is clicked
   * @property {(e: any) => any} onkeypress Function to call when the card is pressed
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

  function handleFeatureCardClick() {
    if (!link) return
    if (external) window.open(link, '_blank')
    else goto(link)
  }
</script>

<div
  class="feature-item"
  class:clickable={link}
  onclick={handleFeatureCardClick}
  {onkeypress}
  role="link"
  tabindex="0"
>
  <div class="flex justify-between items-start">
    {#if icon?.type}
      <div class="icon">
        {#if icon.type === 'svg'}
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html icon.value}
        {:else if icon.type === 'iconify'}
          <IconifyIcon {...icon} />
        {/if}
      </div>
    {/if}
    {#if external}
      <External />
    {/if}
  </div>
  <div class="feature-title">
    {title}
  </div>
  <div class="feature-desc">
    {description}
  </div>
</div>

<style>
  .clickable {
    --at-apply: 'cursor-pointer';
  }
  .clickable:hover {
    --at-apply: 'b-black/10 dark:b-white/16 shadow-lg shadow-black/5 dark:shadow-black/40';
    transform: translateY(-2px);
  }
  .feature-title {
    --at-apply: 'font-600 mt-4';
  }
  .feature-desc {
    --at-apply: 'text-zinc-6 dark:text-zinc-4 mt-2 text-[14px] leading-6';
  }
  .feature-item {
    --at-apply: 'bg-white dark:bg-[#202023] p-5 rounded-xl b-1 b-solid b-black/6 dark:b-white/8 transition-all transition-200';
  }
  .icon {
    --at-apply: 'text-9 inline-flex items-center p-1.5 bg-black/5 dark:bg-white/8 rounded-lg';
  }
</style>
