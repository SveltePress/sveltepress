<script >
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
      <div>
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
        <img src={heroImage} alt={siteConfig.title} w-60 />
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
        <div font-600 mb-2 pt-2>
          {fe.title}
        </div>
        <div text-slate-5 mt-4>
          {fe.description}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  :global(.theme-default--page-layout h2) {
    --at-apply: border-t-solid border-t border-light-8 dark:border-gray-7 pt-4 mt-8 mb-4;
  }
  .home-page {
    --at-apply: max-w-[1152px] mx-auto sm:pt-14 sm:px-0 px-4 pt-4;
  }
  .title {
    --at-apply: text-16 grid grid-cols-12 font-700 leading-18;
  }
  .intro {
    --at-apply: col-start-1 sm:col-span-7 col-span-12 row-start-2 sm:row-start-1
      text-center sm:text-left;
  }
  .hero-image {
    --at-apply: flex items-center justify-center col-start
      sm:col-span-5 col-span-6 col-start-4 sm:col-start-8;
  }
  .gradient-title {
    background-image: linear-gradient(to right, #fa709a 0%, #fee140 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .tagline {
    --at-apply: text-slate-5 dark:text-slate-4 text-6 mt-4 font-500 leading-9;
  }
  .actions {
    --at-apply: flex gap-4 mt-4 justify-center sm:justify-start;
  }
  .features {
    --at-apply: grid sm:grid-cols-3 gap-4 mt-6 grid-cols-1 mb-4;
  }
  .feature-item {
    --at-apply: bg-white dark:bg-gray-9 p-4 rounded-lg hover:shadow-md
      transition-shadow transition-300;
  }
  .icon {
    --at-apply: text-10 inline-flex items-center p-1 bg-[#e5e5e5] 
      dark:bg-[#252525] rounded-md;
  }
</style>

