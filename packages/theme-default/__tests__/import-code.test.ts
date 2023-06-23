import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { mdToSvelte } from '@sveltepress/vite'
import codeImport, { importRe } from '../src/markdown/code-import'
import highlighter from '../src/markdown/highlighter'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const mdPath = resolve(__dirname, 'code-import.md')
const mdContent = readFileSync(mdPath, 'utf-8')

describe('code import', async () => {
  it('existing and non-existing file', async () => {
    expect(mdContent).toMatchInlineSnapshot(`
      "## Title

      @code(./fake-file.ts)

      @code(/src/index.ts,20,37)"
    `)

    const { code } = await mdToSvelte({
      mdContent,
      filename: mdPath,
      highlighter,
      remarkPlugins: [codeImport],
    })
    expect(code).toMatchInlineSnapshot(`
      "<h2>Title</h2>
      <p>@code(./fake-file.ts)</p>

      <div class=\\"svp-code-block-wrapper\\">
        <div class=\\"svp-code-block\\">
          
          <pre class=\\"shiki vitesse-light\\" style=\\"background-color: #ffffff\\"><code><span class=\\"line\\"><span style=\\"color: #AB5959\\">const </span><span style=\\"color: #B07D48\\">VIRTUAL_PWA</span><span style=\\"color: #AB5959\\"> = </span><span style=\\"color: #B56959AA\\">&#39;</span><span style=\\"color: #B56959\\">virtual:pwa-info</span><span style=\\"color: #B56959AA\\">&#39;</span></span>
      <span class=\\"line\\"><span style=\\"color: #AB5959\\">const </span><span style=\\"color: #B07D48\\">VIRTUAL_PWA_SVELTE_REGISTER</span><span style=\\"color: #AB5959\\"> = </span><span style=\\"color: #B56959AA\\">&#39;</span><span style=\\"color: #B56959\\">virtual:pwa-register/svelte</span><span style=\\"color: #B56959AA\\">&#39;</span></span>
      <span class=\\"line\\"></span>
      <span class=\\"line\\"><span style=\\"color: #AB5959\\">const </span><span style=\\"color: #B07D48\\">DEFAULT_GRADIENT</span><span style=\\"color: #AB5959\\"> = </span><span style=\\"color: #999999\\">&#123;</span></span>
      <span class=\\"line\\"><span style=\\"color: #999999\\">  </span><span style=\\"color: #998418\\">start</span><span style=\\"color: #999999\\">: </span><span style=\\"color: #B56959AA\\">&#39;</span><span style=\\"color: #B56959\\">#fa709a</span><span style=\\"color: #B56959AA\\">&#39;</span><span style=\\"color: #999999\\">,</span></span>
      <span class=\\"line\\"><span style=\\"color: #999999\\">  </span><span style=\\"color: #998418\\">end</span><span style=\\"color: #999999\\">: </span><span style=\\"color: #B56959AA\\">&#39;</span><span style=\\"color: #B56959\\">#fee140</span><span style=\\"color: #B56959AA\\">&#39;</span><span style=\\"color: #999999\\">,</span></span>
      <span class=\\"line\\"><span style=\\"color: #999999\\">&#125;</span></span>
      <span class=\\"line\\"></span>
      <span class=\\"line\\"><span style=\\"color: #AB5959\\">const </span><span style=\\"color: #B07D48\\">DEFAULT_PRIMARY</span><span style=\\"color: #AB5959\\"> = </span><span style=\\"color: #B56959AA\\">&#39;</span><span style=\\"color: #B56959\\">#fb7185</span><span style=\\"color: #B56959AA\\">&#39;</span></span>
      <span class=\\"line\\"></span>
      <span class=\\"line\\"><span style=\\"color: #AB5959\\">const </span><span style=\\"color: #B07D48\\">DEFAULT_HOVER</span><span style=\\"color: #AB5959\\"> = </span><span style=\\"color: #B56959AA\\">&#39;</span><span style=\\"color: #B56959\\">#f43f5e</span><span style=\\"color: #B56959AA\\">&#39;</span></span>
      <span class=\\"line\\"></span>
      <span class=\\"line\\"><span style=\\"color: #1E754F\\">export</span><span style=\\"color: #AB5959\\"> const </span><span style=\\"color: #B07D48\\">themeOptionsRef</span><span style=\\"color: #999999\\">: &#123;</span></span>
      <span class=\\"line\\"><span style=\\"color: #999999\\">  </span><span style=\\"color: #B07D48\\">value</span><span style=\\"color: #AB5959\\">?</span><span style=\\"color: #999999\\">: </span><span style=\\"color: #2E808F\\">DefaultThemeOptions</span></span>
      <span class=\\"line\\"><span style=\\"color: #999999\\">&#125; </span><span style=\\"color: #AB5959\\">= </span><span style=\\"color: #999999\\">&#123;</span></span>
      <span class=\\"line\\"><span style=\\"color: #999999\\">  </span><span style=\\"color: #998418\\">value</span><span style=\\"color: #999999\\">: </span><span style=\\"color: #AB5959\\">undefined</span><span style=\\"color: #999999\\">,</span></span>
      <span class=\\"line\\"><span style=\\"color: #999999\\">&#125;</span></span>
      <span class=\\"line\\"></span>
      <span class=\\"line\\"></span></code></pre>
          <pre class=\\"shiki night-owl\\" style=\\"background-color: #011627\\"><code><span class=\\"line\\"><span style=\\"color: #C792EA\\">const</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #82AAFF; font-style: italic\\">VIRTUAL_PWA</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #C792EA\\">=</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #D9F5DD\\">&#39;</span><span style=\\"color: #ECC48D\\">virtual:pwa-info</span><span style=\\"color: #D9F5DD\\">&#39;</span></span>
      <span class=\\"line\\"><span style=\\"color: #C792EA\\">const</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #82AAFF; font-style: italic\\">VIRTUAL_PWA_SVELTE_REGISTER</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #C792EA\\">=</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #D9F5DD\\">&#39;</span><span style=\\"color: #ECC48D\\">virtual:pwa-register/svelte</span><span style=\\"color: #D9F5DD\\">&#39;</span></span>
      <span class=\\"line\\"></span>
      <span class=\\"line\\"><span style=\\"color: #C792EA\\">const</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #82AAFF; font-style: italic\\">DEFAULT_GRADIENT</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #C792EA\\">=</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #C792EA\\">&#123;</span></span>
      <span class=\\"line\\"><span style=\\"color: #C792EA; font-style: italic\\">  start</span><span style=\\"color: #C792EA\\">:</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #D9F5DD\\">&#39;</span><span style=\\"color: #ECC48D\\">#fa709a</span><span style=\\"color: #D9F5DD\\">&#39;</span><span style=\\"color: #C792EA\\">,</span></span>
      <span class=\\"line\\"><span style=\\"color: #C792EA; font-style: italic\\">  end</span><span style=\\"color: #C792EA\\">:</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #D9F5DD\\">&#39;</span><span style=\\"color: #ECC48D\\">#fee140</span><span style=\\"color: #D9F5DD\\">&#39;</span><span style=\\"color: #C792EA\\">,</span></span>
      <span class=\\"line\\"><span style=\\"color: #C792EA\\">&#125;</span></span>
      <span class=\\"line\\"></span>
      <span class=\\"line\\"><span style=\\"color: #C792EA\\">const</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #82AAFF; font-style: italic\\">DEFAULT_PRIMARY</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #C792EA\\">=</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #D9F5DD\\">&#39;</span><span style=\\"color: #ECC48D\\">#fb7185</span><span style=\\"color: #D9F5DD\\">&#39;</span></span>
      <span class=\\"line\\"></span>
      <span class=\\"line\\"><span style=\\"color: #C792EA\\">const</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #82AAFF; font-style: italic\\">DEFAULT_HOVER</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #C792EA\\">=</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #D9F5DD\\">&#39;</span><span style=\\"color: #ECC48D\\">#f43f5e</span><span style=\\"color: #D9F5DD\\">&#39;</span></span>
      <span class=\\"line\\"></span>
      <span class=\\"line\\"><span style=\\"color: #C792EA; font-style: italic\\">export </span><span style=\\"color: #C792EA\\">const</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #82AAFF; font-style: italic\\">themeOptionsRef</span><span style=\\"color: #7FDBCA\\">:</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #C792EA\\">&#123;</span></span>
      <span class=\\"line\\"><span style=\\"color: #C792EA; font-style: italic\\">  </span><span style=\\"color: #D6DEEB; font-style: italic\\">value</span><span style=\\"color: #7FDBCA\\">?:</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #FFCB8B; font-style: italic\\">DefaultThemeOptions</span></span>
      <span class=\\"line\\"><span style=\\"color: #C792EA\\">&#125;</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #C792EA\\">=</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #C792EA\\">&#123;</span></span>
      <span class=\\"line\\"><span style=\\"color: #C792EA; font-style: italic\\">  value</span><span style=\\"color: #C792EA\\">:</span><span style=\\"color: #C792EA; font-style: italic\\"> </span><span style=\\"color: #82AAFF; font-style: italic\\">undefined</span><span style=\\"color: #C792EA\\">,</span></span>
      <span class=\\"line\\"><span style=\\"color: #C792EA\\">&#125;</span></span>
      <span class=\\"line\\"></span>
      <span class=\\"line\\"></span></code></pre>
          <div class=\\"svp-code-block--lang\\">
            ts
          </div>
          <CopyCode />
          
        </div>
      </div>"
    `)
  })

  it('re tests', async () => {
    const matches = importRe.exec('@code(./foo/bar/Comp.svelte,10,20)')
    expect(matches).toMatchInlineSnapshot(`
      [
        "@code(./foo/bar/Comp.svelte,10,20)",
        "./foo/bar/Comp.svelte,10,20",
        undefined,
        undefined,
      ]
    `)
  })
})
