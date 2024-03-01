{#await import('./Floating.svelte') then floatingComponent}
  <svelte:component this={floatingComponent.default} {...$$restProps}>
    <slot />
    <slot name="floating-content" slot="floating-content" />
  </svelte:component>
{/await}
