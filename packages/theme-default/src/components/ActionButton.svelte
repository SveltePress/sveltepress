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
    --at-apply: 'inline-flex items-center h-12 leading-12 rounded-full px-6 font-500 bg-white dark:bg-[#202023] b-1 b-solid b-black/8 dark:b-white/12 transition-all transition-200 hover:b-svp-primary/50 hover:text-svp-hover hover:shadow-sm';
  }
  .svp-action--primary {
    --at-apply: 'svp-gradient-bg text-white font-600 b-none';
  }
  .svp-action--primary:hover {
    --at-apply: 'text-white shadow-[0_4px_16px_rgba(225,29,72,0.35)]';
  }
  .external-icon {
    --at-apply: 'text-6 ml-2 flex items-center';
  }
  .label {
    --at-apply: 'flex-grow text-center';
  }
</style>
