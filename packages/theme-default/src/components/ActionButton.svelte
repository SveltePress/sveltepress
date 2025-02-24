<script>
  import External from './icons/External.svelte'
  import { getPathFromBase } from './utils'

  /**
   * @typedef {object} Props
   * @property {any} label - The text to display on the button
   * @property {string} [type] - The type of the button
   * @property {any} to - The path to navigate to
   * @property {boolean} [external] - Whether the link is external
   */

  /** @type {Props} */
  let { label, type = '', to, external = false } = $props()
</script>

<a
  href={external ? to : getPathFromBase(to)}
  class={`svp-action ${type ? `svp-action--${type}` : ''}`}
  target={external ? '_blank' : ''}
>
  <span class="label">
    {label}
  </span>
  {#if external}
    <div class="external-icon">
      <External />
    </div>
  {/if}
</a>

<style>
  .svp-action {
    --at-apply: 'inline-flex items-center h-12 leading-12 rounded-6 px-6 bg-white dark:bg-zinc-8 transition-300 transition-shadow hover:shadow dark:hover:shadow-gray-6';
  }
  .svp-action--primary {
    --at-apply: 'svp-gradient-bg text-white dark:text-warm-gray-8';
  }
  .external-icon {
    --at-apply: 'text-6 ml-2 flex items-center';
  }
  .label {
    --at-apply: 'flex-grow text-center';
  }
</style>
