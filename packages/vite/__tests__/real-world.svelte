<p>
  This feature integrate <a href="https://github.com/twoslashes/twoslash"
    >Twoslash</a
  >
</p>
<p>All of the Typescript code blocks would provide inline type hover.</p>
<h2>Enable twoslash</h2>
<ul>
  <li>Install @sveltepress/twoslash package</li>
</ul>
<p>@install-pkg(@sveltepress/twoslash)</p>
<ul>
  <li>Config <code>highlighter.twoslash</code> to <code>true</code></li>
</ul>

<div class="svp-code-block-wrapper">
  <div class="svp-code-block--title">vite.config.(js|ts)</div>

  <div class="svp-code-block">
    <div
      class="svp-code-block--command-line svp-code-block--diff-bg-add"
      style="top: calc(12em + 12px);"
    >
      <div class="svp-code-block--diff-add">+</div>
    </div>
    <div
      class="svp-code-block--command-line svp-code-block--diff-bg-add"
      style="top: calc(13.5em + 12px);"
    >
      <div class="svp-code-block--diff-add">+</div>
    </div>
    <div
      class="svp-code-block--command-line svp-code-block--diff-bg-add"
      style="top: calc(15em + 12px);"
    >
      <div class="svp-code-block--diff-add">+</div>
    </div>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <pre
      class="shiki shiki-themes vitesse-light night-owl"
      style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb"
      tabindex="0"><code
        ><span class="line"
          ><span
            style="color:#1E754F;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"
            >import</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB"> &#123;</span><span
            style="color:#B07D48;--shiki-dark:#D6DEEB"> defaultTheme</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB"> &#125;</span><span
            style="color:#1E754F;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"> from</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span
            style="color:#B56959;--shiki-dark:#ECC48D"
            >@sveltepress/theme-default</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span
        >
<span class="line"
          ><span
            style="color:#1E754F;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"
            >import</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB"> &#123;</span><span
            style="color:#B07D48;--shiki-dark:#D6DEEB"> sveltepress</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB"> &#125;</span><span
            style="color:#1E754F;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"> from</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span
            style="color:#B56959;--shiki-dark:#ECC48D">@sveltepress/vite</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span
        >
<span class="line"
          ><span
            style="color:#1E754F;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"
            >import</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB"> &#123;</span><span
            style="color:#B07D48;--shiki-dark:#D6DEEB"> defineConfig</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB"> &#125;</span><span
            style="color:#1E754F;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"> from</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span
            style="color:#B56959;--shiki-dark:#ECC48D">vite</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span
        >
<span class="line"></span>
<span class="line"
          ><span
            style="color:#1E754F;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"
            >export</span
          ><span
            style="color:#1E754F;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"> default</span
          ><span
            style="color:#59873A;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> defineConfig</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">(&#123;</span></span
        >
<span class="line"
          ><span style="color:#998418;--shiki-dark:#D6DEEB">  plugins</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">: [</span></span
        >
<span class="line"
          ><span
            style="color:#59873A;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic">    sveltepress</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">(&#123;</span></span
        >
<span class="line"
          ><span style="color:#998418;--shiki-dark:#D6DEEB">      theme</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">: </span><span
            style="color:#59873A;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"
            >defaultTheme</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">(&#123;</span></span
        >
<span class="line"
          ><span
            style="color:#998418;--shiki-dark:#D6DEEB">        highlighter</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB"
            >: &#123; </span></span
        >
<span class="line"
          ><span
            style="color:#998418;--shiki-dark:#D6DEEB">          twoslash</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">: </span><span
            style="color:#1E754F;--shiki-dark:#FF5874">true</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB"></span></span
        >
<span class="line"
          ><span
            style="color:#999999;--shiki-dark:#D6DEEB">        &#125; </span></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">      &#125;)</span
          ></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">    &#125;)</span
          ></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">  ]</span></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">&#125;)</span></span
        ></code
      ></pre>
    <div class="svp-code-block--lang">ts</div>
    <CopyCode />
  </div>
</div>
<h2>Basic type annotation</h2>

<div class="svp-code-block-wrapper">
  <div class="svp-code-block">
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <pre
      class="shiki shiki-themes vitesse-light night-owl"
      style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb"
      tabindex="0"><code
        ><span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">```</span><span
            style="color:#393A34;--shiki-dark:#D6DEEB">ts</span
          ></span
        >
<span class="line"
          ><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span
            style="color:#B07D48;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> foo</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span
            style="color:#1E754F;font-style:inherit;--shiki-dark:#FF5874;--shiki-dark-font-style:italic"> false</span
          ></span
        >
<span class="line"></span>
<span class="line"
          ><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span
            style="color:#B07D48;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> obj</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span
            style="color:#999999;--shiki-dark:#C792EA"> &#123;</span
          ></span
        >
<span class="line"
          ><span
            style="color:#998418;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">  a</span
          ><span style="color:#999999;--shiki-dark:#C792EA">:</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span
          ><span style="color:#B56959;--shiki-dark:#ECC48D">a</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">'</span
          ><span style="color:#999999;--shiki-dark:#C792EA">,</span></span
        >
<span class="line"
          ><span
            style="color:#998418;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">  b</span
          ><span style="color:#999999;--shiki-dark:#C792EA">:</span><span
            style="color:#2F798A;--shiki-dark:#F78C6C"> 1</span
          ></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#C792EA">&#125;</span></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">```</span></span
        ></code
      ></pre>
    <div class="svp-code-block--lang">md</div>
    <CopyCode />
  </div>
</div>
<h2>Errors</h2>

<div class="svp-code-block-wrapper">
  <div class="svp-code-block">
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <pre
      class="shiki shiki-themes vitesse-light night-owl"
      style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb"
      tabindex="0"><code
        ><span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">```</span><span
            style="color:#393A34;--shiki-dark:#D6DEEB">ts</span
          ></span
        >
<span class="line"
          ><span style="color:#A0ADA0;--shiki-dark:#637777">//</span><span
            style="color:#A0ADA0;font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic"> @errors: 2304 2322</span
          ></span
        >
<span class="line"
          ><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span
            style="color:#B07D48;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> foo</span
          ><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span
            style="color:#2E8F82;font-style:inherit;--shiki-dark:#FFCB8B;--shiki-dark-font-style:italic"> Foo</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span
            style="color:#AB5959;font-style:inherit;--shiki-dark:#FF5874;--shiki-dark-font-style:italic"> null</span
          ></span
        >
<span class="line"></span>
<span class="line"
          ><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span
            style="color:#B07D48;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> a</span
          ><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span
            style="color:#2E8F82;font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> number</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span
          ><span style="color:#B56959;--shiki-dark:#ECC48D">1</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">'</span
          ></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">```</span></span
        ></code
      ></pre>
    <div class="svp-code-block--lang">md</div>
    <CopyCode />
  </div>
</div>
<h2>Queries</h2>

<div class="svp-code-block-wrapper">
  <div class="svp-code-block">
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <pre
      class="shiki shiki-themes vitesse-light night-owl"
      style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb"
      tabindex="0"><code
        ><span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">```</span><span
            style="color:#393A34;--shiki-dark:#D6DEEB">ts</span
          ></span
        >
<span class="line"
          ><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span
            style="color:#B07D48;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> hi</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span
          ><span style="color:#B56959;--shiki-dark:#ECC48D">Hello</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">'</span
          ></span
        >
<span class="line"
          ><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span
            style="color:#B07D48;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> msg</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span
            style="color:#B5695977;--shiki-dark:#D6DEEB"> `</span
          ><span style="color:#1E754F;--shiki-dark:#D3423E">$&#123;</span><span
            style="color:#B56959;font-style:inherit;--shiki-dark:#D6DEEB;--shiki-dark-font-style:italic"
            >hi</span
          ><span style="color:#1E754F;--shiki-dark:#D3423E">&#125;</span><span
            style="color:#B56959;font-style:inherit;--shiki-dark:#ECC48D;--shiki-dark-font-style:italic"
            >, world</span
          ><span style="color:#B5695977;--shiki-dark:#D6DEEB">`</span></span
        >
<span class="line"
          ><span style="color:#A0ADA0;--shiki-dark:#637777">//</span><span
            style="color:#A0ADA0;font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic">    ^?</span
          ></span
        >
<span class="line"
          ><span style="color:#A0ADA0;--shiki-dark:#637777">//</span></span
        >
<span class="line"
          ><span style="color:#A0ADA0;--shiki-dark:#637777">//</span></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">```</span></span
        ></code
      ></pre>
    <div class="svp-code-block--lang">md</div>
    <CopyCode />
  </div>
</div>
<h2>Cut codes</h2>
<h3>Cut before</h3>
<p>
  use <code>// ---cut---</code> or <code>// ---cut-before---</code> can cut all codes
  before this line
</p>

<div class="svp-code-block-wrapper">
  <div class="svp-code-block">
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <pre
      class="shiki shiki-themes vitesse-light night-owl"
      style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb"
      tabindex="0"><code
        ><span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">```</span><span
            style="color:#393A34;--shiki-dark:#D6DEEB">ts</span
          ></span
        >
<span class="line"
          ><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span
            style="color:#B07D48;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> level</span
          ><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span
            style="color:#2E8F82;font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> string</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span
          ><span style="color:#B56959;--shiki-dark:#ECC48D">Danger</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">'</span
          ></span
        >
<span class="line"
          ><span style="color:#A0ADA0;--shiki-dark:#637777">//</span><span
            style="color:#A0ADA0;font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic"> ---cut---</span
          ></span
        >
<span class="line"
          ><span style="color:#B07D48;--shiki-dark:#D6DEEB">console</span><span
            style="color:#999999;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"
            >.</span
          ><span
            style="color:#59873A;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"
            >log</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span
            style="color:#B07D48;--shiki-dark:#D6DEEB">level</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">)</span></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">```</span></span
        ></code
      ></pre>
    <div class="svp-code-block--lang">md</div>
    <CopyCode />
  </div>
</div>
<h3>Cut after</h3>
<p>use <code>// ---cut-after---</code> can cut all codes after this line</p>

<div class="svp-code-block-wrapper">
  <div class="svp-code-block">
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <pre
      class="shiki shiki-themes vitesse-light night-owl"
      style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb"
      tabindex="0"><code
        ><span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">```</span><span
            style="color:#393A34;--shiki-dark:#D6DEEB">ts</span
          ></span
        >
<span class="line"
          ><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span
            style="color:#B07D48;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> level</span
          ><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span
            style="color:#2E8F82;font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> string</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span
          ><span style="color:#B56959;--shiki-dark:#ECC48D">Danger</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">'</span
          ></span
        >
<span class="line"
          ><span style="color:#A0ADA0;--shiki-dark:#637777">//</span><span
            style="color:#A0ADA0;font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic"> ---cut-before---</span
          ></span
        >
<span class="line"
          ><span style="color:#B07D48;--shiki-dark:#D6DEEB">console</span><span
            style="color:#999999;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"
            >.</span
          ><span
            style="color:#59873A;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"
            >log</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span
            style="color:#B07D48;--shiki-dark:#D6DEEB">level</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">)</span></span
        >
<span class="line"
          ><span style="color:#A0ADA0;--shiki-dark:#637777">//</span><span
            style="color:#A0ADA0;font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic"> ---cut-after---</span
          ></span
        >
<span class="line"
          ><span style="color:#B07D48;--shiki-dark:#D6DEEB">console</span><span
            style="color:#999999;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"
            >.</span
          ><span
            style="color:#59873A;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"
            >log</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">'</span
          ><span style="color:#B56959;--shiki-dark:#ECC48D"
            >This is not shown</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span><span
            style="color:#999999;--shiki-dark:#D6DEEB">)</span
          ></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">```</span></span
        ></code
      ></pre>
    <div class="svp-code-block--lang">md</div>
    <CopyCode />
  </div>
</div>
<h3>Cut start/end</h3>
<p>
  use <code>// ---cut-start---</code> and <code>// ---cut-end---</code> to cut contents
  between them
</p>

<div class="svp-code-block-wrapper">
  <div class="svp-code-block">
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <pre
      class="shiki shiki-themes vitesse-light night-owl"
      style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb"
      tabindex="0"><code
        ><span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">```</span><span
            style="color:#393A34;--shiki-dark:#D6DEEB">ts</span
          ></span
        >
<span class="line"
          ><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span
            style="color:#B07D48;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> level</span
          ><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span
            style="color:#2E8F82;font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> string</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span
          ><span style="color:#B56959;--shiki-dark:#ECC48D">Danger</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">'</span
          ></span
        >
<span class="line"
          ><span style="color:#A0ADA0;--shiki-dark:#637777">//</span><span
            style="color:#A0ADA0;font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic"> ---cut-start---</span
          ></span
        >
<span class="line"
          ><span style="color:#B07D48;--shiki-dark:#D6DEEB">console</span><span
            style="color:#999999;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"
            >.</span
          ><span
            style="color:#59873A;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"
            >log</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span
            style="color:#B07D48;--shiki-dark:#D6DEEB">level</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">)</span><span
            style="color:#A0ADA0;--shiki-dark:#637777"> //</span
          ><span
            style="color:#A0ADA0;font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic"> This is not shown.</span
          ></span
        >
<span class="line"
          ><span style="color:#A0ADA0;--shiki-dark:#637777">//</span><span
            style="color:#A0ADA0;font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic"> ---cut-end---</span
          ></span
        >
<span class="line"
          ><span style="color:#B07D48;--shiki-dark:#D6DEEB">console</span><span
            style="color:#999999;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"
            >.</span
          ><span
            style="color:#59873A;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"
            >log</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">'</span
          ><span style="color:#B56959;--shiki-dark:#ECC48D">This is shown</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span><span
            style="color:#999999;--shiki-dark:#D6DEEB">)</span
          ></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">```</span></span
        ></code
      ></pre>
    <div class="svp-code-block--lang">md</div>
    <CopyCode />
  </div>
</div>
<h2>Twoslash for svelte</h2>
<div>
  <p>Svelte v4 only</p>
  <p>
    For now the twoslash feature can only work with svelte v4 syntax. Will
    update it soon.
  </p>
</div>

<div class="svp-code-block-wrapper">
  <div class="svp-code-block">
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <pre
      class="shiki shiki-themes vitesse-light night-owl"
      style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb"
      tabindex="0"><code
        ><span class="line"
          ><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;</span><span
            style="color:#1E754F;--shiki-dark:#CAECE6">script</span
          ><span style="color:#999999;--shiki-dark:#7FDBCA">></span></span
        >
<span class="line"
          ><span
            style="color:#1E754F;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">  import</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB"> &#123;</span><span
            style="color:#B07D48;--shiki-dark:#D6DEEB"> onMount</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB"> &#125;</span><span
            style="color:#1E754F;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"> from</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span
            style="color:#B56959;--shiki-dark:#ECC48D">svelte</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span
        >
<span class="line"></span>
<span class="line"
          ><span style="color:#AB5959;--shiki-dark:#C792EA">  let</span><span
            style="color:#999999;--shiki-dark:#C792EA"> &#123;</span
          ><span style="color:#B07D48;--shiki-dark:#D7DBE0"> message</span><span
            style="color:#999999;--shiki-dark:#C792EA"> =</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span
            style="color:#B56959;--shiki-dark:#ECC48D">World</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span><span
            style="color:#999999;--shiki-dark:#C792EA"> &#125;</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span
            style="color:#999999;--shiki-dark:#C792EA"> $</span
          ><span
            style="color:#59873A;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"
            >props</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">()</span></span
        >
<span class="line"></span>
<span class="line"
          ><span style="color:#AB5959;--shiki-dark:#C792EA">  let</span><span
            style="color:#B07D48;--shiki-dark:#D7DBE0"> count</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span
            style="color:#999999;--shiki-dark:#C792EA"> $</span
          ><span
            style="color:#59873A;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"
            >state</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span
            style="color:#2F798A;--shiki-dark:#F78C6C">0</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">)</span></span
        >
<span class="line"></span>
<span class="line"
          ><span
            style="color:#59873A;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic">  onMount</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span
            style="color:#999999;--shiki-dark:#D9F5DD">()</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =></span><span
            style="color:#999999;--shiki-dark:#D6DEEB"> &#123;</span
          ></span
        >
<span class="line"
          ><span
            style="color:#B07D48;font-style:inherit;--shiki-dark:#7FDBCA;--shiki-dark-font-style:italic">    console</span
          ><span
            style="color:#999999;font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"
            >.</span
          ><span
            style="color:#59873A;font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"
            >log</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">'</span
          ><span style="color:#B56959;--shiki-dark:#ECC48D">mount</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">'</span
          ><span style="color:#999999;--shiki-dark:#D6DEEB">)</span></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#D6DEEB">  &#125;)</span
          ></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;/</span><span
            style="color:#1E754F;--shiki-dark:#CAECE6">script</span
          ><span style="color:#999999;--shiki-dark:#7FDBCA">></span></span
        >
<span class="line"></span>
<span class="line"
          ><span style="color:#A0ADA0;--shiki-dark:#637777">&#x3C;!--</span
          ><span
            style="color:#A0ADA0;font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic"> eslint-disable </span><span
            style="color:#A0ADA0;--shiki-dark:#637777">--></span
          ></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;</span><span
            style="color:#1E754F;--shiki-dark:#CAECE6">button</span
          ><span
            style="color:#B07D48;font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> onclick</span
          ><span style="color:#999999;--shiki-dark:#7FDBCA">=</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">"</span
          ><span style="color:#999999;--shiki-dark:#D3423E">&#123;</span><span
            style="color:#999999;--shiki-dark:#D9F5DD">()</span
          ><span style="color:#999999;--shiki-dark:#C792EA"> =></span><span
            style="color:#B56959;--shiki-dark:#D6DEEB"> count</span
          ><span style="color:#AB5959;--shiki-dark:#C792EA">++</span><span
            style="color:#999999;--shiki-dark:#D3423E">&#125;</span
          ><span style="color:#B5695977;--shiki-dark:#D9F5DD">"</span><span
            style="color:#999999;--shiki-dark:#7FDBCA">></span
          ></span
        >
<span class="line"
          ><span
            style="color:#393A34;--shiki-dark:#D6DEEB">  Count is: </span><span
            style="color:#999999;--shiki-dark:#D3423E">&#123;</span
          ><span style="color:#B07D48;--shiki-dark:#D6DEEB">count</span><span
            style="color:#999999;--shiki-dark:#D3423E">&#125;</span
          ></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;/</span><span
            style="color:#1E754F;--shiki-dark:#CAECE6">button</span
          ><span style="color:#999999;--shiki-dark:#7FDBCA">></span></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;</span><span
            style="color:#1E754F;--shiki-dark:#CAECE6">div</span
          ><span
            style="color:#B07D48;font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> class</span
          ><span style="color:#999999;--shiki-dark:#7FDBCA">=</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">"</span
          ><span style="color:#B56959;--shiki-dark:#ECC48D">text-6</span><span
            style="color:#B5695977;--shiki-dark:#D9F5DD">"</span
          ><span style="color:#999999;--shiki-dark:#7FDBCA">></span></span
        >
<span class="line"
          ><span
            style="color:#393A34;--shiki-dark:#D6DEEB">  Hello, </span><span
            style="color:#999999;--shiki-dark:#D3423E">&#123;</span
          ><span style="color:#B07D48;--shiki-dark:#D6DEEB">message</span><span
            style="color:#999999;--shiki-dark:#D3423E">&#125;</span
          ></span
        >
<span class="line"
          ><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;/</span><span
            style="color:#1E754F;--shiki-dark:#CAECE6">div</span
          ><span style="color:#999999;--shiki-dark:#7FDBCA">></span></span
        ></code
      ></pre>
    <div class="svp-code-block--lang">svelte</div>
    <CopyCode />
  </div>
</div>
