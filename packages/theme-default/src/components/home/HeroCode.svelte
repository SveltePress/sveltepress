<!--
  Interactive hero visual: stylized "+page.md → rendered page" dual-pane
  showcase supporting interactive Svelte 5 Runes, Callouts, and Twoslash tabs.
-->
<script lang="ts">
  const {
    title = 'Hello',
    messageBefore = 'Svelte in ',
    messageStrong = 'markdown',
    messageAfter = '',
    tipLabel = 'TIP',
    counterLabel = 'Count: 1',
  }: {
    title?: string
    messageBefore?: string
    messageStrong?: string
    messageAfter?: string
    tipLabel?: string
    counterLabel?: string
  } = $props()

  type Tab = 'runes' | 'callouts' | 'twoslash'
  let activeTab: Tab = $state('runes')

  const counterPrefix = $derived(counterLabel.replace(/\d+$/, '') || 'Count: ')
  const initialCount = $derived(Number(counterLabel.match(/\d+$/)?.[0] ?? 1))

  let clickCount = $state(0)
  const currentCount = $derived(initialCount + clickCount)
</script>

<div class="hero-code">
  <!-- Code Editor Pane -->
  <div class="pane pane-md">
    <div class="pane-bar">
      <div class="dots" aria-hidden="true">
        <span class="dot dot-close"></span>
        <span class="dot dot-min"></span>
        <span class="dot dot-max"></span>
      </div>
      <div class="tab-list" role="tablist" aria-label="Hero Code Showcase Tabs">
        <button
          type="button"
          role="tab"
          class="code-tab"
          class:active={activeTab === 'runes'}
          aria-selected={activeTab === 'runes'}
          onclick={() => (activeTab = 'runes')}
        >
          Runes
        </button>
        <button
          type="button"
          role="tab"
          class="code-tab"
          class:active={activeTab === 'callouts'}
          aria-selected={activeTab === 'callouts'}
          onclick={() => (activeTab = 'callouts')}
        >
          Callouts
        </button>
        <button
          type="button"
          role="tab"
          class="code-tab"
          class:active={activeTab === 'twoslash'}
          aria-selected={activeTab === 'twoslash'}
          onclick={() => (activeTab = 'twoslash')}
        >
          Twoslash
        </button>
      </div>
    </div>

    <pre class="code">
      {#if activeTab === 'runes'}
        <span class="c-dim">---</span>
<span class="c-key">title</span><span
          class="c-dim">:</span
        > <span class="c-str">{title}</span>
<span class="c-dim">---</span>

<span
          class="c-head"># {title}</span
        >

<span class="c-tip">:::tip</span>
{messageBefore}<span class="c-bold"
          >**{messageStrong}**</span
        >{messageAfter}
<span class="c-tip">:::</span>

<span class="c-tag"
          >&lt;script&gt;</span
        >
  <span class="c-kw">let</span> count = <span class="c-fn">$state</span
        >({currentCount})
<span class="c-tag">&lt;/script&gt;</span>

<span
          class="c-tag"
          >&lt;button onclick=&#123;() =&gt; count++&#125;&gt;</span
        >
  {counterPrefix}&#123;count&#125;
<span class="c-tag"
          >&lt;/button&gt;</span
        >
      {:else if activeTab === 'callouts'}
        <span class="c-head"># Notes & Callouts</span>

<span class="c-tip"
          >:::tip</span
        >
{messageBefore}<span class="c-bold">**{messageStrong}**</span
        >{messageAfter}
<span class="c-tip">:::</span>

<span class="c-warn"
          >:::warning</span
        >
Full SvelteKit power!
<span class="c-warn">:::</span>
      {:else if activeTab === 'twoslash'}
        <span class="c-dim">// @filename: app.ts</span>
<span class="c-kw"
          >interface</span
        > <span class="c-type">SiteConfig</span> &#123;
  <span class="c-key"
          >title</span
        ><span class="c-dim">:</span> <span class="c-type">string</span>
  <span
          class="c-key">version</span
        ><span class="c-dim">:</span> <span class="c-type">string</span
        >
&#125;

<span class="c-kw">const</span> site<span class="c-dim">:</span
        > <span class="c-type">SiteConfig</span> = &#123;
  title<span
          class="c-dim">:</span
        > <span class="c-str">'SveltePress'</span>,
  <span class="c-twoslash"
          >// ^? (property) title: string</span
        >
&#125;
      {/if}
    </pre>
  </div>

  <!-- Live Rendered Preview Pane -->
  <div class="pane pane-render">
    <div class="pane-bar">
      <div class="dots" aria-hidden="true">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <div class="render-url">
        <span class="status-live" aria-hidden="true"></span>
        <span>localhost:5173</span>
      </div>
    </div>
    <div class="render-body">
      {#if activeTab === 'runes'}
        <div class="r-title">{title}</div>
        <div class="r-line w-9/10"></div>
        <div class="r-tip">
          <div class="r-tip-label">{tipLabel}</div>
          <div class="r-line r-tip-line w-8/10"></div>
        </div>
        <button
          type="button"
          class="r-btn interactive"
          onclick={() => clickCount++}
          aria-label="{counterPrefix}{currentCount}"
        >
          {counterPrefix}{currentCount}
        </button>
      {:else if activeTab === 'callouts'}
        <div class="r-tip">
          <div class="r-tip-label">{tipLabel}</div>
          <div class="r-tip-text">
            Pro Tip: SveltePress preserves full SvelteKit power.
          </div>
        </div>
        <div class="r-warn">
          <div class="r-warn-label">NOTE</div>
          <div class="r-warn-text">Zero-config required.</div>
        </div>
      {:else if activeTab === 'twoslash'}
        <div class="r-twoslash">
          <div class="twoslash-preview">
            <span class="ts-kw">const</span> site = &#123;
            <div class="twoslash-target">
              <span class="ts-prop">title</span>
              <div class="twoslash-popup">
                <span class="c-dim">(property)</span> SiteConfig.title:
                <span class="c-type">string</span>
              </div>
            </div>
            &#125;
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .hero-code {
    --at-apply: 'relative sm:col-span-5 col-span-12 h-[310px] sm:h-[330px] max-w-[420px] w-full mx-auto sm:mx-0 self-center select-none';
    font-size: 11px;
  }
  .pane {
    --at-apply: 'absolute rounded-xl b-1 b-solid b-black/8 dark:b-white/10 bg-white/90 dark:bg-[#18181b]/92 shadow-xl shadow-black/8 dark:shadow-black/50 overflow-hidden';
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .pane-md {
    --at-apply: 'top-0 left-0 w-[78%] z-1';
  }
  .pane-render {
    --at-apply: 'right-0 bottom-0 w-[66%] z-2';
  }
  .pane-bar {
    --at-apply: 'flex items-center justify-between gap-1.5 px-3 py-2 b-b-1 b-b-solid b-b-black/6 dark:b-b-white/8 bg-black/2 dark:bg-white/2';
  }
  .dots {
    --at-apply: 'flex items-center gap-1.5 shrink-0';
  }
  .dot {
    --at-apply: 'w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/20';
  }
  .dot-close {
    --at-apply: 'bg-rose-500/60 dark:bg-rose-400/50';
  }
  .dot-min {
    --at-apply: 'bg-amber-500/60 dark:bg-amber-400/50';
  }
  .dot-max {
    --at-apply: 'bg-emerald-500/60 dark:bg-emerald-400/50';
  }
  .tab-list {
    --at-apply: 'flex items-center gap-1 overflow-x-auto';
  }
  .code-tab {
    --at-apply: 'px-2 py-0.5 rounded text-[10px] font-500 text-zinc-5 dark:text-zinc-4 b-none bg-transparent hover:text-zinc-9 dark:hover:text-zinc-1 cursor-pointer transition-colors duration-150';
  }
  .code-tab.active {
    --at-apply: 'bg-black/6 dark:bg-white/10 text-svp-primary-deep dark:text-svp-primary font-600';
  }
  .render-url {
    --at-apply: 'flex items-center gap-1.5 text-[10px] text-zinc-5 dark:text-zinc-4 font-mono';
  }
  .status-live {
    --at-apply: 'w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse';
  }
  .code {
    --at-apply: 'm-0 px-3.5 py-3 leading-[1.75] text-zinc-7 dark:text-zinc-3 overflow-hidden text-left';
    font-family: var(--svp-code-font);
  }
  .c-dim {
    --at-apply: 'text-zinc-4 dark:text-zinc-6';
  }
  .c-key {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary';
  }
  .c-kw {
    --at-apply: 'text-purple-600 dark:text-purple-400 font-600';
  }
  .c-fn {
    --at-apply: 'text-blue-600 dark:text-blue-400 font-600';
  }
  .c-type {
    --at-apply: 'text-teal-600 dark:text-teal-400';
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
  .c-warn {
    --at-apply: 'text-amber-6 dark:text-amber-4';
  }
  .c-bold {
    --at-apply: 'font-700 text-zinc-8 dark:text-zinc-1';
  }
  .c-tag {
    --at-apply: 'text-amber-7 dark:text-amber-4';
  }
  .c-twoslash {
    --at-apply: 'text-zinc-4 dark:text-zinc-5 italic';
  }
  .render-body {
    --at-apply: 'px-3.5 py-3 flex flex-col gap-2 min-h-[120px] justify-center';
  }
  .r-title {
    --at-apply: 'svp-gradient-text font-800 text-[16px] leading-tight w-fit';
  }
  .r-line {
    --at-apply: 'h-1.5 rounded-full bg-black/8 dark:bg-white/12';
  }
  .r-btn {
    --at-apply: 'svp-gradient-bg text-white text-[11px] font-600 rounded-lg px-3 py-1.5 w-fit mt-1 leading-none b-none inline-flex items-center gap-1 select-none shadow-sm';
  }
  .r-btn.interactive {
    --at-apply: 'cursor-pointer hover:opacity-95 active:scale-95 transition-transform duration-150';
  }
  .r-tip {
    --at-apply: 'b-l-3 b-l-solid b-l-emerald-5 bg-emerald-5/10 dark:bg-emerald-4/12 rounded-r-md px-2.5 py-1.5 text-left';
  }
  .r-tip-label {
    --at-apply: 'text-[9px] font-700 tracking-[0.08em] text-emerald-7 dark:text-emerald-4';
  }
  .r-tip-text {
    --at-apply: 'text-[10px] text-zinc-7 dark:text-zinc-3 mt-0.5 leading-snug';
  }
  .r-line.r-tip-line {
    --at-apply: 'bg-emerald-6/20 dark:bg-emerald-4/20';
  }
  .r-warn {
    --at-apply: 'b-l-3 b-l-solid b-l-amber-5 bg-amber-5/10 dark:bg-amber-4/12 rounded-r-md px-2.5 py-1.5 text-left';
  }
  .r-warn-label {
    --at-apply: 'text-[9px] font-700 tracking-[0.08em] text-amber-7 dark:text-amber-4';
  }
  .r-warn-text {
    --at-apply: 'text-[10px] text-zinc-7 dark:text-zinc-3 mt-0.5 leading-snug';
  }
  .r-twoslash {
    --at-apply: 'py-2 px-1 text-left';
  }
  .twoslash-preview {
    --at-apply: 'font-mono text-[11px] text-zinc-7 dark:text-zinc-3 relative';
  }
  .ts-kw {
    --at-apply: 'text-purple-600 dark:text-purple-400 font-600';
  }
  .twoslash-target {
    --at-apply: 'inline-block relative text-svp-primary-deep dark:text-svp-primary font-600';
  }
  .ts-prop {
    --at-apply: 'underline decoration-dotted decoration-zinc-4';
  }
  .twoslash-popup {
    --at-apply: 'absolute bottom-[130%] left-0 z-10 px-2 py-1 rounded bg-zinc-9 text-zinc-1 text-[9.5px] font-mono shadow-md whitespace-nowrap pointer-events-none';
  }
</style>
