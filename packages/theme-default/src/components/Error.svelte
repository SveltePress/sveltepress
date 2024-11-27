<script>
  import Home from './icons/Home.svelte'
  import Link from './Link.svelte'

  const { error = {} } = $props()
</script>

<div class="error">
  <div class="code">{error.code || 404}</div>
  <div class="title">
    {error.message || 'Not Found'}
  </div>
  <Link label="Take me home" to="/">
    {#snippet pre()}
      <div class="home-icon">
        <Home />
      </div>
    {/snippet}
  </Link>
</div>

<style>
  .error {
    --at-apply: 'mt-[20vh] max-w-[380px] mx-auto text-center flex flex-col items-center justify-center';
  }
  .code {
    --at-apply: 'text-30';
  }
  .title {
    --at-apply: 'text-6 text-warm-gray-6 dark:text-warm-gray-4 my-4 leading-10';
  }
  .home-icon {
    --at-apply: 'text-6 ml-2 flex items-center';
  }
</style>
