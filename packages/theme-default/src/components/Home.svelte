<script>
  import ActionButton from './ActionButton.svelte'
  import Feature from './home/Feature.svelte'

  const {
    features = [],
    actions = [],
    tagline = '',
    siteConfig,
    title = siteConfig.title,
    description = siteConfig.description,
    heroImage,
    children,
  } = $props()
</script>

<div class="home-page">
  <div class="title">
    <div class="intro">
      <h1 class="gradient-title">
        {title}
      </h1>
      <div class="description">
        {description}
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

  {#if actions.length}
    <div class="actions">
      {#each actions as action}
        <ActionButton {...action} />
      {/each}
    </div>
  {/if}

  {#if features.length}
    <div class="features">
      {#each features as fe, i}
        <Feature {...fe} {i} />
      {/each}
    </div>
  {/if}
</div>

{#if children}
  <div class="home-content">
    {@render children()}
  </div>
{/if}

<style>
  .home-page {
    --at-apply: 'sm:w-[70vw] max-w-[1152px] mx-auto sm:px-0 px-4 pt-6 sm:pt-14';
    position: relative;
  }
  .home-page::before {
    content: ' ';
    position: absolute;
    top: -60px;
    left: -10%;
    right: -10%;
    height: 460px;
    background:
      radial-gradient(42% 65% at 28% 0%, rgb(225 29 72 / 12%), transparent 70%),
      radial-gradient(38% 58% at 74% 6%, rgb(217 119 6 / 9%), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .home-page > * {
    position: relative;
    z-index: 1;
  }
  :global(.dark) .home-page::before {
    background:
      radial-gradient(
        42% 65% at 28% 0%,
        rgb(251 113 133 / 17%),
        transparent 70%
      ),
      radial-gradient(38% 58% at 74% 6%, rgb(251 191 36 / 10%), transparent 70%);
  }
  .title {
    --at-apply: 'sm:text-16 text-10 grid grid-cols-12 font-700 leading-[1.15] tracking-[-0.02em]';
  }
  .description {
    --at-apply: 'text-8 leading-[1.2] sm:text-inherit text-zinc-9 dark:text-zinc-1';
  }
  .intro {
    --at-apply: 'col-start-1 sm:col-span-7 col-span-12 row-start-2 sm:row-start-1 text-center sm:text-left';
  }
  .gradient-title {
    --at-apply: 'svp-gradient-text pb-1 m-0 text-[1em] leading-[inherit] font-700';
  }
  .tagline {
    --at-apply: 'text-zinc-5 dark:text-zinc-4 text-6 mt-5 font-400 leading-9';
  }
  .actions {
    --at-apply: 'grid-cols-1 px-10 sm:px-0 grid sm:flex gap-4 mt-8 justify-center sm:justify-start max-w-[320px] mx-auto sm:max-w-none';
  }
  /* flex + centered wrap so an orphan last row (e.g. 5 cards in 3 columns)
     centers instead of leaving a hole at the bottom-right */
  .features {
    --at-apply: 'flex flex-wrap justify-center gap-5 mt-10 sm:mt-16 mb-8';
  }
  .features > :global(.feature-item) {
    --at-apply: 'basis-full sm:basis-[calc((100%-1.25rem)/2)] md:basis-[calc((100%-2.5rem)/3)] grow-0 shrink-0 box-border';
  }
  .home-content {
    --at-apply: 'sm:w-[70vw] max-w-[1152px] mx-auto px-4 sm:px-0 pb-12 sm:pb-24';
  }
</style>
