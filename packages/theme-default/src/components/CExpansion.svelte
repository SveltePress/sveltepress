<script>
  import Svelte from './icons/Svelte.svelte'
  import SvelteWithColor from './icons/SvelteWithColor.svelte'
  import ArrowDown from './icons/ArrowDown.svelte'
  import slide from './actions/slide'

  /**
   * The title of the expansion
   * @type {string}
   */
  export let title = ''

  /**
   * Determine whether the expansion is expanded or not. It is recomended to use `bind:expanded`
   * @type {boolean}
   */
  export let expanded = false

  /**
   * Determine the expand direction, `false` means down, `true` means up
   * @type {boolean}
   */
  export let reverse = false

  /**
   * Custom header style
   * @type {string}
   */
  export let headerStyle = ''

  /**
   * The panel body dom
   * @type {HTMLDivElement}
   */
  let bodyDom

  function onHeaderClick() {
    expanded = !expanded
  }
</script>

<div class={`c-expansion ${expanded ? 'c-expansion--expanded' : ''}`}>
  {#if reverse}
    <div use:slide={expanded} bind:this={bodyDom} class="c-expansion--body">
      <!--  
        Expansion body content 
      -->
      <slot />
    </div>
  {/if}
  <!-- The header click function, emit the expand status exchange -->
  <div
    class="c-expansion--header"
    style={headerStyle}
    on:click|stopPropagation={onHeaderClick}
    on:keypress={onHeaderClick}
  >
    <div class="c-expansion--header-left">
      <div class="c-expansion--icon">
        <!-- The content before title -->
        {#if expanded}
          <slot name="icon-expanded">
            <SvelteWithColor />
          </slot>
        {:else}
          <slot name="icon-fold">
            <Svelte />
          </slot>
        {/if}
      </div>
      <div class="c-expansion--title">
        <!-- Customize the title content -->
        <slot name="title">
          {title}
        </slot>
      </div>
    </div>
    <div
      class={`c-expansion--arrow ${
        expanded ? 'c-expansion--arrow-expanded' : ''
      }`}
    >
      <!-- Customize the arrow dom -->
      <slot name="arrow">
        <ArrowDown />
      </slot>
    </div>
  </div>
  {#if !reverse}
    <div use:slide={expanded} bind:this={bodyDom} class="c-expansion--body">
      <!--  
        Expansion body content 
      -->
      <slot />
    </div>
  {/if}
</div>

<style>
  :global(.svp-live-code--container) {
    --at-apply: 'mb-8 shadow-sm b-1 b-solid b-gray-2  dark:b-warmgray-8 rounded';
  }
  :global(.svp-live-code--demo) {
    --at-apply: p-4;
  }
  :global(.c-expansion--body .svp-code-block) {
    --at-apply: mb-none;
  }
  .c-expansion--header {
    --at-apply: rounded-b flex justify-between px-4 py-2 items-center;
  }
  .c-expansion--icon {
    --at-apply: mr-2 text-6 flex items-center;
  }
  .c-expansion--arrow {
    --at-apply: text-6 flex items-center;
  }
  .c-expansion--header-left {
    --at-apply: flex items-center;
  }
  .c-expansion--title {
    --at-apply: text-3.5;
  }
</style>
