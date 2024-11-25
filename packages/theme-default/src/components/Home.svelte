<script>
  import ActionButton from './ActionButton.svelte'
  import Feature from './home/Feature.svelte'

  const {
    features = [],
    actions = [],
    tagline = '',
    siteConfig,
    heroImage,
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
    {@render heroImage()}
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

<style>
  .home-page {
    --at-apply: 'sm:w-[70vw] max-w-[1152px] mx-auto sm:px-0 px-4 pt-4';
  }
  .title {
    --at-apply: 'sm:text-16 text-10 grid grid-cols-12 font-700 leading-24';
  }
  .description {
    --at-apply: 'text-8 leading-10 sm:text-inherit';
  }
  .intro {
    --at-apply: 'col-start-1 sm:col-span-7 col-span-12 row-start-2 sm:row-start-1 text-center sm:text-left';
  }
  .gradient-title {
    --at-apply: 'svp-gradient-text';
  }
  .tagline {
    --at-apply: 'text-slate-5 dark:text-slate-4 text-6 mt-4 font-500 leading-9 font-normal';
  }
  .actions {
    --at-apply: 'grid-cols-1 px-10 sm:px-0 grid sm:flex gap-4 mt-4 justify-center sm:justify-start max-w-[320px] mx-auto sm:max-w-none';
  }
  .features {
    --at-apply: 'grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 grid-cols-1 mb-4';
  }
</style>
