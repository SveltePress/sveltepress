<script>
  import { createEventDispatcher, onMount, tick } from 'svelte'
  import { slide } from 'svelte/transition'
  import { cubicInOut } from 'svelte/easing'

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

  const dispatch = createEventDispatcher()

  function onHeaderClick() {
    expanded = !expanded
  }

  function onTransitionEnd() {
    /**
     * Dispatch when the toggle transition end
     */
    dispatch('toggled')
  }

  onMount(() => {
    tick().then(() => {
      /**
       * Emit when the initial height compute is done
       */
      dispatch('ready')
    })
  })

  const resetHeight = () => {}
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
      on:introend={onTransitionEnd}
      on:outroend={onTransitionEnd}
      bind:this={bodyDom}
      class="c-expansion--body"
    >
      <!--  
        Expansion body content 
        @param {() => void} recomputedHeight The method to recomputed the body height.
      -->
      <slot recomputedHeight={resetHeight} />
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
      <div class="c-expansion--icon mr-2">
        <!-- The content before title -->
        {#if expanded}
          <slot name="icon-expanded">
            <div class="i-vscode-icons-file-type-svelte text-6"></div>
          </slot>
        {:else}
          <slot name="icon-fold">
            <div class="i-carbon-logo-svelte text-6"></div>
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
      class={`c-expansion--arrow ${expanded ? 'c-expansion--arrow-expanded' : ''}`}
    >
      <!-- Customize the arrow dom -->
      <slot name="arrow">
        <div class="i-ph-caret-down-light" />
      </slot>
    </div>
  </div>
  {#if !reverse && expanded}
    <div
      transition:slide
      on:introend={onTransitionEnd}
      on:outroend={onTransitionEnd}
      bind:this={bodyDom}
      class="c-expansion--body"
    >
      <!--  
        Expansion body content 
        @param {() => void} recomputedHeight The method to recomputed the body height.
      -->
      <slot recomputedHeight={resetHeight} />
    </div>
  {/if}
</div>
