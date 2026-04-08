<script>
  import ActionButton from './ActionButton.svelte'
  import Feature from './home/Feature.svelte'

  const {
    features = [],
    actions = [],
    tagline = '',
    siteConfig,
    heroImage,
    children,
  } = $props()
</script>

<div class="home-page">
  <div class="title">
    <div class="intro">
      <div class="gradient-title">
        {siteConfig.title}
      </div>
      <div class="description">
        {siteConfig.description}
      </div>
      {#if tagline}
        <div class="tagline">
          {tagline}
        </div>
      {/if}
    </div>
    {#if heroImage}
      {@render heroImage()}
    {/if}
  </div>

  <div class="actions">
    {#each actions as action}
      <ActionButton {...action} />
    {/each}
  </div>

  <div class="features">
    {#each features as fe, i}
      <Feature {...fe} {i} />
    {/each}
  </div>
</div>

{@render children?.()}

<style>
  .home-page {
    --at-apply: 'sm:w-[70vw] max-w-[1152px] mx-auto sm:px-0 px-6 pt-8 relative';
  }
  .home-page::before {
    content: '';
    position: absolute;
    top: -80px;
    left: -10%;
    width: 60%;
    height: 500px;
    background: radial-gradient(
      ellipse at 30% 50%,
      rgba(251, 113, 133, 0.08) 0%,
      transparent 70%
    );
    pointer-events: none;
    z-index: -1;
  }
  :global(html.dark) .home-page::before {
    background: radial-gradient(
      ellipse at 30% 50%,
      rgba(251, 113, 133, 0.04) 0%,
      transparent 70%
    );
  }
  .title {
    --at-apply: 'sm:text-16 text-10 grid grid-cols-12 font-800 leading-24';
  }
  .description {
    --at-apply: 'text-8 leading-10 sm:text-inherit font-700';
  }
  .intro {
    --at-apply: 'col-start-1 sm:col-span-7 col-span-12 row-start-2 sm:row-start-1 text-center sm:text-left';
  }
  .gradient-title {
    --at-apply: 'svp-gradient-text';
  }
  .tagline {
    --at-apply: 'text-slate-5 dark:text-slate-4 text-6 mt-6 font-400 leading-9';
  }
  .actions {
    --at-apply: 'grid-cols-1 px-10 sm:px-0 grid sm:flex gap-4 mt-8 justify-center sm:justify-start max-w-[320px] mx-auto sm:max-w-none';
  }
  .features {
    --at-apply: 'grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12 grid-cols-1 mb-8';
  }
</style>
