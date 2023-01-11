<script>
  import Navbar from './Navbar.svelte'

</script>

<main class="pt-[56px]">
  <Navbar />
  <slot />
</main>

<style>
  :global(body) {
    --at-apply: bg-light-2 dark:bg-zinc-8 text-[#213547] dark:text-slate-2;
    font-family:  "Inter var experimental", "Inter var", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";;
	}
  :global(a) {
    --at-apply: text-[#213547] dark:text-[#efefef] decoration-none;
  }

  :global(p) {
    --at-apply: leading-6;
  }

  :global(ul) {
    padding-left: 1.25rem;
    margin: 16px 0;
    line-height: 2em;
  }

  :global(li+li) {
    margin-top: 0.5rem;
  }

  :global(html.dark ::-webkit-scrollbar) {
    width: 10px;
  }
  :global(html.dark ::-webkit-scrollbar-track) {
    --at-apply: bg-gray-8;
  }
  :global(html.dark ::-webkit-scrollbar-thumb) {
    --at-apply: bg-black;
    border-radius: 6px;
  }
</style>