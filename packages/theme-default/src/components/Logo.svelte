<script>
  import themeOptions from 'sveltepress:theme-default'
  import siteConfig from 'sveltepress:site'
  import NavItem from './NavItem.svelte'

</script>

<NavItem to="/" title={siteConfig.title}>
  {#if themeOptions.logo}
    <img class="logo" src={themeOptions.logo} alt={siteConfig.title} />
    <span font-600 ml-2>
      {siteConfig.title}
    </span>
  {/if}
</NavItem>

<style>
  .logo {
    --at-apply: h-[32px];
  }
</style>

