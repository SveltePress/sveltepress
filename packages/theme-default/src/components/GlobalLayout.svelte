<script>
  import '@docsearch/css'
  import 'uno.css'
  import '../style.css'
  import AjaxBar from './AjaxBar.svelte'
  import { anchors, sidebarCollapsed } from './layout'
  import Navbar from './Navbar.svelte'
  import Toc from './Toc.svelte'
  import Sidebar from './Sidebar.svelte'
  import { afterNavigate, beforeNavigate } from '$app/navigation'
  
  let ajaxBar

  beforeNavigate(() => {
    ajaxBar.start()
  })

  afterNavigate(() => {
    ajaxBar.end()
    $sidebarCollapsed = true
  })

  $$restProps
</script>

<main>
  <AjaxBar bind:this={ajaxBar} />
  <Sidebar />
  <Navbar />
  <slot />

  <Toc anchors={$anchors} />
</main>

<style>
  main {
    --at-apply: pt-[56px] sm:pt-[73px];
  }
  :global(body) {
    --at-apply: bg-light-4 dark:bg-zinc-9 text-[#213547] dark:text-warm-gray-2 scroll-smooth;
    font-family:  "Inter var experimental", "Inter var", "Inter", 
      ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 
      "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, 
      "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", 
      "Segoe UI Symbol", "Noto Color Emoji";
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
    --at-apply: bg-[#e9e9e9] dark:bg-[#3a3a3a] dark:text-[#c9def1] text-[#476582] 
      px-[6px] py-[3px] rounded break-all;
  }
  :global(pre.shiki code) {
    --at-apply: bg-transparent dark:bg-transparent p-unset block;
  }

  :global(.svp-code-block) {
    --at-apply: relative bg-white dark:bg-[#011627] 
      transition-shadow transition-300 hover:shadow
      overflow-y-hidden py-[12px] px-18px rounded-lg text-[14px] mb-8;
  }
  :global(.svp-code-block--with-line-numbers) {
    --at-apply: pl-12;
  }
   :global(.svp-code-block--line-numbers) {
    --at-apply: absolute left-0 top-0 bottom-0 py-inherit 
      text-3 px-3 text-gray-4
      leading-[21px] b-r-solid b-r b-r-light-4 dark:b-r-gray-8;
  }
  :global(.svp-code-block:hover .svp-code-block--lang) {
    --at-apply: opacity-0;
  }
  :global(.c-expansion--body .svp-code-block) {
    --at-apply: rounded-none;
  }
  :global(.svp-code-block--lang) {
    --at-apply: absolute top-2 right-3 z-100 text-cool-gray-3 
      dark:text-cool-gray-7 text-[12px] transition-300 transition-opacity;
  }
  :global(.svp-code-block--command-line) {
    --at-apply: absolute left-0 right-0 z-2 h-[1.5em];
  }
  :global(.svp-code-block--focus) {
    --at-apply: bg-white dark:bg-black pointer-events-none 
      bg-opacity-20 dark:bg-opacity-20 absolute left-0 right-0 z-4
      transition-300 transition-opacity;
    backdrop-filter: blur(1.5px);
  }
  :global(.svp-code-block--diff-bg-add) {
    --at-apply: bg-green-4 bg-opacity-20 dark:bg-green-8 
      dark:bg-opacity-30; 
  }
  :global(.svp-code-block--diff-bg-sub) {
    --at-apply: bg-rose-4 bg-opacity-20 dark:bg-red-8 dark:bg-opacity-30;
  }
  :global(.svp-code-block--with-line-numbers .svp-code-block--diff-add),
  :global(.svp-code-block--with-line-numbers .svp-code-block--diff-sub) {
    --at-apply: pl-8;
  }
  :global(.svp-code-block--diff-add) {
    --at-apply: text-green-4;
  }
  :global(.svp-code-block--diff-sub) {
    --at-apply: text-rose-4;
  }
  :global(.svp-code-block--diff-add),
  :global(.svp-code-block--diff-sub) {
    --at-apply: absolute left-[4px] top-0 bottom-0 leading-[1.5em];
  }
  :global(.svp-code-block--hl) {
    --at-apply: bg-black dark:bg-white bg-opacity-10 dark:bg-opacity-10;
  }
  :global(.svp-code-block:hover .svp-code-block--focus) {
    --at-apply: opacity-0;
  }
  :global(blockquote) {
    --at-apply: border-l-[4px] border-l-solid border-gray-4 m-none bg-gray-2
      indent-[1em] text-gray-4 py-[4px] my-4
      dark:border-l-gray-5 dark:bg-gray-8;
  }
  :global(blockquote p) {
    --at-apply: m-none;
  }
 
  :global(table) {
    --at-apply: border-collapse w-full;
  }
  :global(table th) {
    --at-apply: text-left p-2;
  }
  :global(table tbody tr) {
    --at-apply: border-t-1 border-t-solid border-gray-2 dark:border-gray-7;
  }
  :global(table tbody tr td) {
    --at-apply: p-2;
  }
  :global(.svp-anchor-item) {
    --at-apply: relative bottom-[74px];
  }
</style>