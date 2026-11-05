<!-- src/components/CodeTabs.svelte -->
<!--
  Interactive tabs for `::::code-tabs` (see remark-code-tabs): several panels
  under one set of tabs, only the active one shown, collapsible, with a copy
  button. The panels are already rendered in the page by the markdown
  pipeline; this moves them into the tab frame and shows one at a time.

  `data-vertical` is the old blog's CodeTabVertical: a button group over the
  top-right corner of the code, panels sliding up and down.
-->
<script lang="ts">
  import { onMount } from 'svelte'

  interface Group {
    labels: string[]
    panels: HTMLElement[]
    active: number
    open: boolean
    copied: boolean
    vertical: boolean
    hideCopy: boolean
    mount: HTMLElement
  }

  let groups = $state<Group[]>([])

  onMount(() => {
    // Outer groups first (document order): a nested group's placeholder sits
    // inside an outer panel and moves along with it.
    const nodes = [
      ...document.querySelectorAll<HTMLElement>(
        '.sp-post-content .sp-code-tabs[data-active]',
      ),
    ]
    groups = nodes.map(el => {
      const panels = [
        ...el.querySelectorAll<HTMLElement>(':scope > .sp-code-tabs__src'),
      ]
      const labels = panels.map(p => p.dataset.label ?? '')
      const idx = labels.indexOf(el.dataset.active ?? '')
      // Keep the group where the author put it: swap the static markup for
      // an empty mount point, and render the interactive tabs into it.
      const mount = document.createElement('div')
      el.replaceWith(mount)
      return {
        labels,
        panels,
        active: idx === -1 ? 0 : idx,
        open: true,
        copied: false,
        vertical: el.hasAttribute('data-vertical'),
        hideCopy: el.hasAttribute('data-hide-copy'),
        mount,
      }
    })
  })

  $effect(() => {
    for (const group of groups) {
      group.panels.forEach((panel, i) => {
        panel.hidden = i !== group.active
      })
    }
  })

  async function copy(group: Group) {
    const panel = group.panels[group.active]
    const code = panel?.querySelector('code') ?? panel
    try {
      await navigator.clipboard.writeText(code?.textContent ?? '')
      group.copied = true
      setTimeout(() => (group.copied = false), 2000)
    } catch {
      group.copied = false
    }
  }

  function select(group: Group, i: number) {
    group.active = i
    group.open = true
  }
</script>

{#each groups as group (group.mount)}
  <div
    class="sp-code-tabs"
    class:sp-code-tabs--vertical={group.vertical}
    {@attach (node: HTMLElement) => {
      group.mount.replaceWith(node)
      return () => node.replaceWith(group.mount)
    }}
  >
    {#if !group.vertical}
      <div class="sp-code-tabs__bar">
        <div class="sp-code-tabs__tabs" role="tablist">
          {#each group.labels as label, i (i)}
            <button
              type="button"
              role="tab"
              class="sp-code-tabs__tab"
              class:sp-code-tabs__tab--active={group.active === i}
              aria-selected={group.active === i}
              onclick={() => select(group, i)}>{label}</button
            >
          {/each}
        </div>
        <button
          type="button"
          class="sp-code-tabs__toggle"
          aria-label={group.open ? '收起' : '展开'}
          aria-expanded={group.open}
          onclick={() => (group.open = !group.open)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class:sp-code-tabs__chevron--open={group.open}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    {:else}
      <div class="sp-code-tabs__switch" role="tablist">
        {#each group.labels as label, i (i)}
          <button
            type="button"
            role="tab"
            class="sp-code-tabs__switch-btn"
            class:sp-code-tabs__switch-btn--active={group.active === i}
            aria-selected={group.active === i}
            onclick={() => select(group, i)}>{label}</button
          >
        {/each}
      </div>
    {/if}
    <div
      class="sp-code-tabs__panel"
      role="tabpanel"
      hidden={!group.open}
      {@attach (node: HTMLElement) => {
        node.prepend(...group.panels)
      }}
    >
      {#if !group.hideCopy}
        <button
          type="button"
          class="sp-code-tabs__copy"
          class:sp-code-tabs__copy--done={group.copied}
          aria-label="复制代码"
          onclick={() => copy(group)}>{group.copied ? '已复制' : '复制'}</button
        >
      {/if}
    </div>
  </div>
{/each}

<style>
  .sp-code-tabs {
    margin: 0 0 1.25rem;
    border: 1px solid var(--sp-blog-border, rgba(255, 255, 255, 0.08));
    border-radius: 10px;
    overflow: hidden;
    background: var(--sp-blog-surface);
    font-family: var(--sp-font-sans);
  }
  .sp-code-tabs__bar {
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
    border-bottom: 1px solid var(--sp-blog-border, rgba(255, 255, 255, 0.08));
  }
  .sp-code-tabs__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    min-width: 0;
  }
  .sp-code-tabs__tab {
    appearance: none;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--sp-blog-muted);
    font: inherit;
    font-size: 0.85rem;
    padding: 0.6rem 0.9rem;
    cursor: pointer;
  }
  .sp-code-tabs__tab--active {
    color: var(--sp-blog-primary);
    border-bottom-color: var(--sp-blog-primary);
  }
  .sp-code-tabs__toggle {
    margin-left: auto;
    appearance: none;
    background: none;
    border: none;
    color: var(--sp-blog-muted);
    padding: 0 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .sp-code-tabs__toggle svg {
    transition: transform 0.15s ease;
  }
  .sp-code-tabs__chevron--open {
    transform: rotate(180deg);
  }
  .sp-code-tabs__panel {
    position: relative;
  }
  .sp-code-tabs__panel[hidden] {
    display: none;
  }
  .sp-code-tabs__panel :global(.sp-code-tabs__src[hidden]) {
    display: none;
  }
  /* Panels are rendered by the post pipeline: drop their own outer gaps so
     they sit flush inside the frame. */
  .sp-code-tabs__panel :global(.sp-code-tabs__src > :first-child) {
    margin-top: 0;
  }
  .sp-code-tabs__panel :global(.sp-code-tabs__src > :last-child) {
    margin-bottom: 0;
  }
  .sp-code-tabs__panel :global(.svp-code-block-wrapper) {
    margin: 0;
  }
  .sp-code-tabs__panel
    :global(
      .sp-code-tabs__src
        > :not(.svp-code-block-wrapper):not(.sp-code-tabs):not(.sp-live-code)
    ) {
    padding: 0 1rem;
  }
  .sp-code-tabs__panel :global(.sp-code-tabs__src > figure) {
    padding: 1rem;
    margin: 0;
  }
  .sp-code-tabs__copy {
    position: absolute;
    right: 12px;
    bottom: 12px;
    z-index: 3;
    appearance: none;
    border: none;
    border-radius: 999px;
    background: var(--sp-blog-primary);
    color: #fff;
    font: inherit;
    font-size: 0.75rem;
    padding: 0.3rem 0.75rem;
    cursor: pointer;
  }
  .sp-code-tabs__copy--done {
    background: var(--sp-blog-text);
    color: var(--sp-blog-bg);
  }

  /* Vertical (old CodeTabVertical): button group over the top-right corner. */
  .sp-code-tabs--vertical {
    position: relative;
  }
  .sp-code-tabs__switch {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 3;
    display: flex;
    border-radius: 4px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
  }
  .sp-code-tabs__switch-btn {
    appearance: none;
    border: none;
    background: none;
    color: #fff;
    font: inherit;
    font-size: 0.8rem;
    padding: 0.35rem 0.8rem;
    cursor: pointer;
  }
  .sp-code-tabs__switch-btn--active {
    background: var(--sp-blog-primary);
  }
  .sp-code-tabs--vertical
    .sp-code-tabs__panel
    :global(.sp-code-tabs__src:not([hidden])) {
    animation: sp-code-tabs-slide-up 0.3s ease;
  }
  @keyframes sp-code-tabs-slide-up {
    from {
      transform: translateY(24px);
      opacity: 0;
    }
    to {
      transform: none;
      opacity: 1;
    }
  }
</style>
