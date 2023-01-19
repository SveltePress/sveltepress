<script>
  import { slide } from 'svelte/transition'
  import { cubicInOut } from 'svelte/easing'
  import Svelte from './icons/Svelte.svelte'
  import SvelteWithColor from './icons/SvelteWithColor.svelte'
  import ArrowDown from './icons/ArrowDown.svelte'

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

<div
  class={`c-expansion ${expanded ? 'c-expansion--expanded' : ''}`}
>
  {#if reverse && expanded}
    <div
      transition:slide={{
        duration: 300,
        easing: cubicInOut,
      }}
      bind:this={bodyDom}
      class="c-expansion--body"
    >
      <!--  
        Expansion body content 
      -->
      <slot />
    </div>
  {/if}
  <!-- The header click function, emit the expand status exchange -->
  <div
    class="c-expansion--header rounded-b flex justify-between px-4 py-2 items-center"
    style={headerStyle}
    on:click|stopPropagation={onHeaderClick}
    on:keypress={onHeaderClick}
  >
    <div class="flex items-center">
      <div class="c-expansion--icon mr-2 text-6 flex items-center">
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
      <div class="c-expansion--title text-3.5">
        <!-- Customize the title content -->
        <slot name="title">
          {title}
        </slot>
      </div>
    </div>
    <div
      class={`c-expansion--arrow ${expanded ? 'c-expansion--arrow-expanded' : ''} text-6 flex items-center`}
    >
      <!-- Customize the arrow dom -->
      <slot name="arrow">
        <ArrowDown />
      </slot>
    </div>
  </div>
  {#if !reverse && expanded}
    <div
      transition:slide
      bind:this={bodyDom}
      class="c-expansion--body"
    >
      <!--  
        Expansion body content 
      -->
      <slot />
    </div>
  {/if}
</div>

<style>
  :global(.svp-live-code--container) {
    --at-apply: mb-8 shadow-sm;
  }
  :global(.svp-live-code--demo) {
    --at-apply: bg-white dark:bg-warm-gray-8 rounded-t 
      p-4 b-t-1 b-x-1 b-gray-2 dark:b-warmgray-9 
      b-t-solid b-x-solid;
  }
</style>