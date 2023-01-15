<script>
  import Navbar from './Navbar.svelte'
  import AjaxBar from './AjaxBar.svelte'
  import { beforeNavigate, afterNavigate } from '$app/navigation'
  
  let ajaxBar

  beforeNavigate(() => {
    ajaxBar.start()
  })

  afterNavigate(() => {
    ajaxBar.end()
  })
</script>

<main class="pt-[56px]">
  <AjaxBar bind:this={ajaxBar} />
  <Navbar />
  <slot />
</main>

<style>
  :global(body) {
    --at-apply: bg-light-4 dark:bg-zinc-9 text-[#213547] dark:text-warm-gray-2 scroll-smooth;
    font-family:  "Inter var experimental", "Inter var", "Inter", 
      ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 
      "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
  ;
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
    height: 10px;
  }
  :global(html.dark ::-webkit-scrollbar-track) {
    --at-apply: bg-gray-8;
  }
  :global(html.dark ::-webkit-scrollbar-thumb) {
    --at-apply: bg-black;
    border-radius: 6px;
  }

  :global(code) {
    --at-apply: bg-[#e9e9e9] dark:bg-[#3a3a3a] dark:text-[#c9def1] text-[#476582] px-[6px] py-[3px] rounded;
  }
  :global(pre.shiki code) {
    --at-apply: bg-transparent dark:bg-transparent p-unset block;
  }

  :global(.svp-code-block) {
    --at-apply: relative bg-white dark:bg-[#011627] 
      overflow-y-hidden py-[12px] px-18px rounded text-[14px] mb-8;
  }
  :global(.svp-code-block--lang) {
    --at-apply: absolute top-2 right-3 z-100 text-cool-gray-3 dark:text-cool-gray-7 text-[12px];
  }
  :global(.svp-code-block--focus) {
    --at-apply: bg-white dark:bg-black pointer-events-none 
      bg-opacity-20 dark:bg-opacity-20 absolute left-0 right-0 z-4
      backdrop-filter-blur backdrop-blur-[1.5px] transition-300 transition-opacity;
  }
  :global(.svp-code-block:hover .svp-code-block--focus) {
    --at-apply: opacity-0;
  }
</style>