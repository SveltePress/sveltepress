<script>
  import ActionButton from './ActionButton.svelte'
  import Apple from './icons/Apple.svelte'
  import Banana from './icons/Banana.svelte'
  import Grapes from './icons/Grapes.svelte'
  import Peach from './icons/Peach.svelte'
  import Tomato from './icons/Tomato.svelte'
  import Watermelon from './icons/Watermelon.svelte'

  export let features = []
  export let actions = []
  export let heroImage = ''
  export let tagline = ''
  export let siteConfig

  const icons = [Apple, Banana, Grapes, Peach, Tomato, Watermelon]

  // Need this for avoid props not provided by let xxx warning
  $$restProps
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
      <div class="hero-image">
        <img src={heroImage} alt={siteConfig.title} width="192" />
      </div>
    {/if}
  </div>

  <div class="actions">
    {#each actions as action}
      <ActionButton {...action} />
    {/each}
  </div>

  <div class="features">
    {#each features as fe, i}
      <div class="feature-item">
        <div class="icon">
          <svelte:component this={icons[i % icons.length]} />
        </div>
        <div class="feature-title">
          {fe.title}
        </div>
        <div class="feature-desc">
          {fe.description}
        </div>
      </div>
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
  .hero-image {
    --at-apply: 'flex items-center justify-center col-start sm:col-span-5 col-span-6 col-start-4 sm:col-start-8';
  }
  .hero-image img {
    --at-apply: 'sm:w-60 w-full max-w-[220px]';
  }
  .gradient-title {
    --at-apply: svp-gradient-text;
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
  .feature-title {
    --at-apply: font-600 mt-3;
  }
  .feature-desc {
    --at-apply: text-slate-5 mt-3 text-[14px];
  }
  .feature-item {
    --at-apply: 'bg-white dark:bg-gray-9 p-4 rounded-lg hover:shadow-md transition-shadow transition-300';
  }
  .icon {
    --at-apply: 'text-10 inline-flex items-center p-1 bg-[#e5e5e5] dark:bg-[#252525] rounded-md';
  }
</style>
