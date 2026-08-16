<!--
  Default hero visual when no `heroImage` is configured: a stylized
  "+page.md → rendered page" split that tells the product story
  (markdown-centered, full SvelteKit power). Pure CSS, no assets.
-->
<div class="hero-code" aria-hidden="true">
  <div class="pane pane-md">
    <div class="pane-bar">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="pane-name">+page.md</span>
    </div>
    <pre class="code"><span class="c-dim">---</span>
<span class="c-key">title</span><span class="c-dim">:</span> <span class="c-str"
        >Hello</span
      >
<span class="c-dim">---</span>

<span class="c-head"># Hello</span>

<span class="c-tip">:::tip</span>
Svelte in <span class="c-bold">**markdown**</span>
<span class="c-tip">:::</span>

<span class="c-tag">&lt;Counter /&gt;</span></pre>
  </div>
  <div class="pane pane-render">
    <div class="pane-bar">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="pane-name">localhost:5173</span>
    </div>
    <div class="render-body">
      <div class="r-title">Hello</div>
      <div class="r-line w-9/10"></div>
      <div class="r-line w-7/10"></div>
      <div class="r-tip">
        <div class="r-tip-label">TIP</div>
        <div class="r-line r-tip-line w-8/10"></div>
      </div>
      <div class="r-btn">Count: 1</div>
    </div>
  </div>
</div>

<style>
  .hero-code {
    --at-apply: 'relative sm:col-span-5 col-span-10 col-start-2 sm:col-start-8 h-[280px] sm:h-[300px] max-w-[360px] w-full mx-auto sm:mx-0 self-center';
    font-size: 11.5px;
  }
  .pane {
    --at-apply: 'absolute rounded-xl b-1 b-solid b-black/8 dark:b-white/10 bg-white/85 dark:bg-[#202023]/90 shadow-xl shadow-black/6 dark:shadow-black/40 overflow-hidden';
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .pane-md {
    --at-apply: 'top-0 left-0 w-[72%] z-1';
  }
  .pane-render {
    --at-apply: 'right-0 bottom-0 w-[62%] z-2';
  }
  .pane-bar {
    --at-apply: 'flex items-center gap-1.5 px-3 py-2 b-b-1 b-b-solid b-b-black/5 dark:b-b-white/6';
  }
  .dot {
    --at-apply: 'w-2 h-2 rounded-full bg-black/12 dark:bg-white/16';
  }
  .pane-name {
    --at-apply: 'ml-2 text-[10px] text-zinc-5 dark:text-zinc-4 tracking-wide';
    font-family: var(--svp-code-font);
  }
  .code {
    --at-apply: 'm-0 px-3.5 py-3 leading-[1.8] text-zinc-6 dark:text-zinc-3 overflow-hidden';
    font-family: var(--svp-code-font);
  }
  .c-dim {
    --at-apply: 'text-zinc-4 dark:text-zinc-6';
  }
  .c-key {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary';
  }
  .c-str {
    --at-apply: 'text-emerald-7 dark:text-emerald-4';
  }
  .c-head {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary font-700';
  }
  .c-tip {
    --at-apply: 'text-emerald-6 dark:text-emerald-4';
  }
  .c-bold {
    --at-apply: 'font-700 text-zinc-8 dark:text-zinc-1';
  }
  .c-tag {
    --at-apply: 'text-amber-7 dark:text-amber-4';
  }
  .render-body {
    --at-apply: 'px-3.5 py-3 flex flex-col gap-2';
  }
  .r-title {
    --at-apply: 'svp-gradient-text font-800 text-[18px] leading-tight w-fit';
  }
  .r-line {
    --at-apply: 'h-1.5 rounded-full bg-black/8 dark:bg-white/12';
  }
  .r-tip {
    --at-apply: 'b-l-3 b-l-solid b-l-emerald-5 bg-emerald-5/8 dark:bg-emerald-4/12 rounded-md px-2.5 py-2 flex flex-col gap-1.5 mt-1';
  }
  .r-tip-label {
    --at-apply: 'text-[9px] font-700 tracking-[0.08em] text-emerald-7 dark:text-emerald-4 leading-none';
  }
  .r-tip-line {
    --at-apply: 'bg-emerald-6/20 dark:bg-emerald-4/20';
  }
  .r-btn {
    --at-apply: 'svp-gradient-bg text-white text-[10px] font-600 rounded-full px-3 py-1.5 w-fit mt-1 leading-none';
  }
</style>
