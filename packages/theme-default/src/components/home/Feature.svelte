<script>
  import IconifyIcon from '../IconifyIcon.svelte'
  import Apple from '../icons/Apple.svelte'
  import Banana from '../icons/Banana.svelte'
  import External from '../icons/External.svelte'
  import Grapes from '../icons/Grapes.svelte'
  import Peach from '../icons/Peach.svelte'
  import Tomato from '../icons/Tomato.svelte'
  import Watermelon from '../icons/Watermelon.svelte'
  import { goto } from '$app/navigation'

  export let i
  export let title
  export let description
  export let link = undefined
  /**
   * @type {import('./types').CustomIcon}
   */
  export let icon = undefined

  $: external = /^https?/.test(link)

  const icons = { Apple, Banana, Grapes, Peach, Tomato, Watermelon }
  const iconsArray = Object.values(icons)

  function handleFeatureCardClick() {
    if (external) window.open(link, '_blank')
    else goto(link)
  }
</script>

<div
  class="feature-item"
  class:clickable={link}
  on:click={handleFeatureCardClick}
  on:keypress
  role="link"
  tabindex="0"
>
  <div class="flex justify-between items-start">
    <div class="icon">
      {#if icon === undefined}
        <svelte:component this={iconsArray[i % iconsArray.length]} />
      {:else if icon.type === 'svg'}
        {@html icon.value}
      {:else if icon.type === 'iconify'}
        <IconifyIcon {...icon} />
      {/if}
    </div>
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
    --uno: 'cursor-pointer';
  }
  .clickable:hover .feature-title {
    --uno: 'underline';
  }
  .feature-title {
    --at-apply: font-600 mt-3;
  }
  .feature-desc {
    --at-apply: text-slate-5 mt-3 text-[14px];
  }
  .feature-item {
    --at-apply: 'bg-white dark:bg-gray-9 p-4 rounded-lg hover:shadow-md transition-shadow transition-300';
  }
  .icon {
    --at-apply: 'text-10 inline-flex items-center p-1 bg-[#e5e5e5] dark:bg-[#252525] rounded-md';
  }
</style>
