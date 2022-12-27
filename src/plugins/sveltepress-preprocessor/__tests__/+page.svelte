<script context="module">
	export const metadata = {"title":"Title"};
	const { title } = metadata;
</script>
<script>
  let count = 7
</script>


<h1>Heading</h1>
<div text-20 text-purple-8>
Hello world!
</div>
<div class="admonition admonition-tip alert alert--success"><div class="admonition-heading"><h5><span class="admonition-icon"><svg
  xmlns="http://www.w3.org/2000/svg"
  width="12"
  height="16"
  viewBox="0 0 12 16"
><path
  fill-rule="evenodd"
  d="M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"
></path></svg></span>Tip</h5></div><div
  class="admonition-content"
><p>Some tip content</p></div></div>
<div bg-white dark:bg-111111 mb-8 shadow-sm rounded-md>
{#await import('$live-code/LiveCodebb56341bb9f.svelte')}
{:then Comp}
  <svelte:component this="{Comp.default}"></svelte:component>
{:catch err}
  <div text-red-5>Live Code Error: {JSON.stringify(err)}</div>
{/await}
{#await import('@casual-ui/svelte/dist/components/CExpansion.svelte')}
{:then CExpansion}
  <svelte:component this={CExpansion} title="Click fold/expand code" reverse={true}>
<pre class="shiki Night Owl" style="background-color: #011627"><code><span class="line"><span style="color: #7FDBCA">&lt;</span><span style="color: #CAECE6">script</span><span style="color: #7FDBCA"> </span><span style="color: #C5E478; font-style: italic">lang</span><span style="color: #7FDBCA">=</span><span style="color: #D9F5DD">&quot;</span><span style="color: #ECC48D">ts</span><span style="color: #D9F5DD">&quot;</span><span style="color: #7FDBCA">&gt;</span></span>
<span class="line"><span style="color: #D6DEEB">  </span><span style="color: #C792EA">let</span><span style="color: #C792EA; font-style: italic"> </span><span style="color: #D6DEEB; font-style: italic">count</span><span style="color: #C792EA; font-style: italic"> </span><span style="color: #C792EA">=</span><span style="color: #C792EA; font-style: italic"> </span><span style="color: #F78C6C">10</span></span>
<span class="line"><span style="color: #D6DEEB">  </span><span style="color: #C792EA">const</span><span style="color: #C792EA; font-style: italic"> </span><span style="color: #82AAFF; font-style: italic">add</span><span style="color: #C792EA; font-style: italic"> </span><span style="color: #C792EA">=</span><span style="color: #C792EA; font-style: italic"> </span><span style="color: #D9F5DD">()</span><span style="color: #C792EA; font-style: italic"> </span><span style="color: #C792EA">=&gt;</span><span style="color: #C792EA; font-style: italic"> </span><span style="color: #C792EA">&#123;</span></span>
<span class="line"><span style="color: #C792EA; font-style: italic">    </span><span style="color: #D6DEEB; font-style: italic">count</span><span style="color: #C792EA">++</span></span>
<span class="line"><span style="color: #C792EA; font-style: italic">  </span><span style="color: #C792EA">&#125;</span></span>
<span class="line"><span style="color: #7FDBCA">&lt;/</span><span style="color: #CAECE6">script</span><span style="color: #7FDBCA">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color: #7FDBCA">&lt;</span><span style="color: #CAECE6">button</span><span style="color: #7FDBCA"> </span><span style="color: #C5E478; font-style: italic">type</span><span style="color: #7FDBCA">=</span><span style="color: #D9F5DD">&quot;</span><span style="color: #ECC48D">button</span><span style="color: #D9F5DD">&quot;</span><span style="color: #7FDBCA"> </span><span style="color: #C792EA; font-style: italic">on</span><span style="color: #7FDBCA">:click=</span><span style="color: #D3423E">&#123;</span><span style="color: #D6DEEB">add</span><span style="color: #D3423E">&#125;</span><span style="color: #7FDBCA">&gt;</span></span>
<span class="line"><span style="color: #D6DEEB">  Count is </span><span style="color: #D3423E">&#123;</span><span style="color: #D6DEEB">count</span><span style="color: #D3423E">&#125;</span></span>
<span class="line"><span style="color: #7FDBCA">&lt;/</span><span style="color: #CAECE6">button</span><span style="color: #7FDBCA">&gt;</span></span>
<span class="line"><span style="color: #7FDBCA">&lt;</span><span style="color: #CAECE6">style</span><span style="color: #7FDBCA">&gt;</span></span>
<span class="line"><span style="color: #D6DEEB">  </span><span style="color: #FF6363">button</span><span style="color: #D6DEEB"> &#123;</span></span>
<span class="line"><span style="color: #D6DEEB">    </span><span style="color: #80CBC4">color</span><span style="color: #D6DEEB">: </span><span style="color: #7FDBCA">orange</span><span style="color: #D6DEEB">;</span></span>
<span class="line"><span style="color: #D6DEEB">  &#125;</span></span>
<span class="line"><span style="color: #7FDBCA">&lt;/</span><span style="color: #CAECE6">style</span><span style="color: #7FDBCA">&gt;</span></span></code></pre>
</svelte:component>
{:catch err}
  <div text-red-5>Expansion Error: {JSON.stringify(err)}</div>
{/await}
</div>
<div bg-white dark:bg-111111 mb-8 shadow-sm rounded-md>
{#await import('$live-code/LiveCodeb56341bb9f9.svelte')}
{:then Comp}
  <svelte:component this="{Comp.default}"></svelte:component>
{:catch err}
  <div text-red-5>Live Code Error: {JSON.stringify(err)}</div>
{/await}
{#await import('@casual-ui/svelte/dist/components/CExpansion.svelte')}
{:then CExpansion}
  <svelte:component this={CExpansion} title="Click fold/expand code" reverse={true}>
<pre class="shiki Night Owl" style="background-color: #011627"><code><span class="line"><span style="color: #7FDBCA">&lt;</span><span style="color: #CAECE6">script</span><span style="color: #7FDBCA">&gt;</span></span>
<span class="line"><span style="color: #D6DEEB">  </span><span style="color: #C792EA">const</span><span style="color: #C792EA; font-style: italic"> </span><span style="color: #82AAFF; font-style: italic">message</span><span style="color: #C792EA; font-style: italic"> </span><span style="color: #C792EA">=</span><span style="color: #C792EA; font-style: italic"> </span><span style="color: #D9F5DD">&#39;</span><span style="color: #ECC48D">Hello world!</span><span style="color: #D9F5DD">&#39;</span></span>
<span class="line"><span style="color: #7FDBCA">&lt;/</span><span style="color: #CAECE6">script</span><span style="color: #7FDBCA">&gt;</span></span>
<span class="line"><span style="color: #7FDBCA">&lt;</span><span style="color: #CAECE6">div</span><span style="color: #7FDBCA"> </span><span style="color: #C5E478; font-style: italic">class</span><span style="color: #7FDBCA">=</span><span style="color: #D9F5DD">&quot;</span><span style="color: #ECC48D">message</span><span style="color: #D9F5DD">&quot;</span><span style="color: #7FDBCA">&gt;</span></span>
<span class="line"><span style="color: #D6DEEB">  </span><span style="color: #D3423E">&#123;</span><span style="color: #D6DEEB">message</span><span style="color: #D3423E">&#125;</span></span>
<span class="line"><span style="color: #7FDBCA">&lt;/</span><span style="color: #CAECE6">div</span><span style="color: #7FDBCA">&gt;</span></span>
<span class="line"><span style="color: #7FDBCA">&lt;</span><span style="color: #CAECE6">style</span><span style="color: #7FDBCA">&gt;</span></span>
<span class="line"><span style="color: #D6DEEB">  </span><span style="color: #C5E478">.</span><span style="color: #C5E478; font-style: italic">message</span><span style="color: #D6DEEB"> &#123;</span></span>
<span class="line"><span style="color: #D6DEEB">    </span><span style="color: #80CBC4">color</span><span style="color: #D6DEEB">: </span><span style="color: #7FDBCA">purple</span><span style="color: #D6DEEB">;</span></span>
<span class="line"><span style="color: #D6DEEB">    </span><span style="color: #80CBC4">font-size</span><span style="color: #D6DEEB">: </span><span style="color: #F78C6C">24</span><span style="color: #FFEB95">px</span><span style="color: #D6DEEB">;</span></span>
<span class="line"><span style="color: #D6DEEB">  &#125;</span></span>
<span class="line"><span style="color: #7FDBCA">&lt;/</span><span style="color: #CAECE6">style</span><span style="color: #7FDBCA">&gt;</span></span></code></pre>
</svelte:component>
{:catch err}
  <div text-red-5>Expansion Error: {JSON.stringify(err)}</div>
{/await}
</div>
