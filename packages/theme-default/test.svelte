<script>
import { CopyCode, Expansion } from '@sveltepress/theme-default/components'
</script>
<div class="svp-live-code--container">
<div class="svp-live-code--demo">
  
{#await import('/.sveltepress/live-code/LiveCodebaa49804eec.svelte')}
  <div class="svp--async-live-code--loading">
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <defs><filter id="svgSpinnersGooeyBalls20"><feGaussianBlur in="SourceGraphic" result="y" stdDeviation="1"/><feColorMatrix in="y" result="z" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7"/><feBlend in="SourceGraphic" in2="z"/></filter></defs><g filter="url(#svgSpinnersGooeyBalls20)"><circle cx="5" cy="12" r="4" fill="currentColor"><animate attributeName="cx" calcMode="spline" dur="2s" keySplines=".36,.62,.43,.99;.79,0,.58,.57" repeatCount="indefinite" values="5;8;5"/></circle><circle cx="19" cy="12" r="4" fill="currentColor"><animate attributeName="cx" calcMode="spline" dur="2s" keySplines=".36,.62,.43,.99;.79,0,.58,.57" repeatCount="indefinite" values="19;16;19"/></circle><animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></g>
    </svg>
  </div>
{:then compoImported}
  <svelte:component this="{compoImported.default}" />
{:catch err}
  <div class="svp--async-live-code--error">
    {err}
  </div>
{/await}

</div>
<Expansion codeType="svelte" title="Click fold/expand code" reverse={true}>
<div class="svp-code-block-wrapper">
  <div class="svp-code-block">
    
    <pre class="shiki vitesse-light" style="background-color: #ffffff"><code><span class="line"><span style="color: #999999">&lt;</span><span style="color: #1E754F">h1</span><span style="color: #999999">&gt;</span><span style="color: #393A34">This is a async svelte live code</span><span style="color: #999999">&lt;/</span><span style="color: #1E754F">h1</span><span style="color: #999999">&gt;</span></span></code></pre>
    <pre class="shiki night-owl" style="background-color: #011627"><code><span class="line"><span style="color: #7FDBCA">&lt;</span><span style="color: #CAECE6">h1</span><span style="color: #7FDBCA">&gt;</span><span style="color: #D6DEEB">This is a async svelte live code</span><span style="color: #7FDBCA">&lt;/</span><span style="color: #CAECE6">h1</span><span style="color: #7FDBCA">&gt;</span></span></code></pre>
    <div class="svp-code-block--lang">
      svelte
    </div>
    <CopyCode />
    
  </div>
</div></Expansion></div>