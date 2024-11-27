<script>
  import slide from './actions/slide'
  import ArrowDown from './icons/ArrowDown.svelte'
  import Markdown from './icons/Markdown.svelte'
  import Svelte from './icons/Svelte.svelte'
  import SvelteWithColor from './icons/SvelteWithColor.svelte'

  /**
   * @typedef {object} Props
   * @property {string} title The title of the expansion
   * @property {boolean} expanded Determine whether the expansion is expanded or not. It is recomended to use `bind:expanded`
   * @property {boolean} reverse Determine the expand direction, `false` means down, `true` means up
   * @property {string} headerStyle Custom header style
   * @property {import('svelte').Snippet} iconFold custom fold icon
   * @property {import('svelte').Snippet} iconExpanded custom expand icon
   * @property {import('svelte').Snippet} customTitle custom title content
   * @property {'svelte' | 'md'} codeType The code type of the icon, `svelte` or `md`
   */

  /** @type {Props} */
  let {
    title,
    expanded = false,
    reverse = false,
    headerStyle = '',
    codeType = 'svelte',
    showIcon = true,
    bodyDom,
    children,
    iconFold,
    iconExpanded,
    customTitle,
  } = $props()

  /**
   *
   * @type {string}
   */

  /**
   * The panel body dom
   * @type {HTMLDivElement}
   */

  function onHeaderClick(e) {
    e.stopPropagation()
    expanded = !expanded
  }
</script>

<!-- Expansion body content -->
{#snippet body()}
  <div use:slide={expanded} bind:this={bodyDom} class="c-expansion--body">
    {@render children?.()}
  </div>
{/snippet}

<!-- Customize icon display in expanded status -->
{#snippet defaultIconExpanded()}
  {#if codeType === 'svelte'}
    <SvelteWithColor />
  {:else if codeType === 'md'}
    <div class="flex items-center text-6 text-svp-primary">
      <Markdown />
    </div>
  {/if}
{/snippet}

<!-- Customize icon display in folded status -->
{#snippet defaultIconFold()}
  {#if codeType === 'svelte'}
    <Svelte />
  {:else if codeType === 'md'}
    <div class="flex items-center text-6">
      <Markdown />
    </div>
  {/if}
{/snippet}

<!-- Customize the title content -->
{#snippet defaultCustomTitle()}
  {title}
{/snippet}

<!-- Customize the arrow dom -->
{#snippet arrow()}
  <ArrowDown />
{/snippet}

<div class={`c-expansion ${expanded ? 'c-expansion--expanded' : ''}`}>
  {#if reverse}
    {@render body()}
  {/if}
  <div
    class="c-expansion--header"
    style={headerStyle}
    onclick={onHeaderClick}
    onkeypress={() => {}}
    role="button"
    tabindex="0"
  >
    <div class="c-expansion--header-left">
      {#if showIcon}
        <div class="c-expansion--icon">
          <!-- The content before title -->
          {#if expanded}
            {#if iconExpanded}
              {@render iconExpanded()}
            {:else}
              {@render defaultIconExpanded()}
            {/if}
          {:else if iconFold}
            {@render iconFold()}
          {:else}
            {@render defaultIconFold()}
          {/if}
        </div>
      {/if}
      <div class="c-expansion--title">
        {#if customTitle}
          {@render customTitle()}
        {:else}
          {@render defaultCustomTitle()}
        {/if}
      </div>
    </div>
    <div
      class={`c-expansion--arrow ${
        expanded ? 'c-expansion--arrow-expanded' : ''
      }`}
    >
      {@render arrow()}
    </div>
  </div>
  {#if !reverse}
    {@render body()}
  {/if}
</div>

<style>
  :global(.svp-live-code--container) {
    --at-apply: 'mb-8 shadow-sm b-1 b-solid b-gray-2  dark:b-warmgray-8 rounded-lg';
  }
  :global(.svp-live-code--demo) {
    --at-apply: 'p-4';
  }
  :global(.c-expansion--body .svp-code-block) {
    --at-apply: 'mb-none';
  }
  .c-expansion--header {
    --at-apply: 'rounded-b flex justify-between px-4 py-2 items-center';
  }
  .c-expansion--icon {
    --at-apply: 'mr-2 text-6 flex items-center';
  }
  .c-expansion--arrow {
    --at-apply: 'text-6 flex items-center';
  }
  .c-expansion--header-left {
    --at-apply: 'flex items-center';
  }
  .c-expansion--title {
    --at-apply: 'text-3.5';
  }
</style>
