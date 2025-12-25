import { mdToSvelte } from '@sveltepress/vite'
import { describe, expect, it } from 'vitest'
import admonitions from '../src/markdown/admonitions'
import highlighter, { initHighlighter } from '../src/markdown/highlighter'

describe('admonitions', async () => {
  await initHighlighter()
  it('tip', async () => {
    const source = `---
foo: bar
---
:::note[Title]{icon=vscode-icons:file-type-svelte}
Some tip content
:::
`
    const { code, data } = await mdToSvelte({
      filename: 'demo.md',
      mdContent: source,
      remarkPlugins: [admonitions],
    })

    expect(code).toMatchInlineSnapshot('"<div class="admonition admonition-note"><div class="admonition-heading"><span class="admonition-icon"><IconifyIcon collection="vscode-icons" name="file-type-svelte" /></span>Title</div><div class="admonition-content"><p>Some tip content</p></div></div>"')

    expect(data).toMatchInlineSnapshot(`
      {
        "foo": "bar",
      }
    `)
  })

  it('with code block', async () => {
    const source = `
:::tip
\`\`\`js
const obj = {} 
\`\`\`
:::
`
    const { code } = await mdToSvelte({
      filename: 'with-code-block.md',
      mdContent: source,
      highlighter,
      remarkPlugins: [admonitions],
    })

    expect(code).toMatchInlineSnapshot(`
      "<div class="admonition admonition-tip"><div class="admonition-heading"><span class="admonition-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M14.5 9.5C14.5 6.47 12.03 4 9 4S3.5 6.47 3.5 9.5c0 2.47 1.49 3.89 2.35 4.5h6.3c.86-.61 2.35-2.03 2.35-4.5z" opacity=".3"/><path fill="currentColor" d="M7 20h4c0 1.1-.9 2-2 2s-2-.9-2-2zm-2-1h8v-2H5v2zm11.5-9.5c0 3.82-2.66 5.86-3.77 6.5H5.27c-1.11-.64-3.77-2.68-3.77-6.5C1.5 5.36 4.86 2 9 2s7.5 3.36 7.5 7.5zm-2 0C14.5 6.47 12.03 4 9 4S3.5 6.47 3.5 9.5c0 2.47 1.49 3.89 2.35 4.5h6.3c.86-.61 2.35-2.03 2.35-4.5zm6.87-2.13L20 8l1.37.63L22 10l.63-1.37L24 8l-1.37-.63L22 6l-.63 1.37zM19 6l.94-2.06L22 3l-2.06-.94L19 0l-.94 2.06L16 3l2.06.94L19 6z"/></svg></span>TIP</div><div class="admonition-content">
      <div class="svp-code-block-wrapper">
        <div class="svp-code-block">
          
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <pre class="shiki shiki-themes vitesse-light night-owl" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> obj</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#999999;--shiki-dark:#C792EA"> &#123;&#125;</span><span style="color:#393A34;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"> </span></span></code></pre>
          <div class="svp-code-block--lang">
            js
          </div>
          <CopyCode />
          
        </div>
      </div></div></div>"
    `)
  })

  it('with inline code', async () => {
    const source = `
:::tip[Tip]
Here is some \`inline code\`
:::
`
    const { code } = await mdToSvelte({
      filename: 'with-code-block.md',
      mdContent: source,
      highlighter,
      remarkPlugins: [admonitions],
    })

    expect(code).toMatchInlineSnapshot(`"<div class="admonition admonition-tip"><div class="admonition-heading"><span class="admonition-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M14.5 9.5C14.5 6.47 12.03 4 9 4S3.5 6.47 3.5 9.5c0 2.47 1.49 3.89 2.35 4.5h6.3c.86-.61 2.35-2.03 2.35-4.5z" opacity=".3"/><path fill="currentColor" d="M7 20h4c0 1.1-.9 2-2 2s-2-.9-2-2zm-2-1h8v-2H5v2zm11.5-9.5c0 3.82-2.66 5.86-3.77 6.5H5.27c-1.11-.64-3.77-2.68-3.77-6.5C1.5 5.36 4.86 2 9 2s7.5 3.36 7.5 7.5zm-2 0C14.5 6.47 12.03 4 9 4S3.5 6.47 3.5 9.5c0 2.47 1.49 3.89 2.35 4.5h6.3c.86-.61 2.35-2.03 2.35-4.5zm6.87-2.13L20 8l1.37.63L22 10l.63-1.37L24 8l-1.37-.63L22 6l-.63 1.37zM19 6l.94-2.06L22 3l-2.06-.94L19 0l-.94 2.06L16 3l2.06.94L19 6z"/></svg></span>Tip</div><div class="admonition-content"><p>Here is some <code>{\`inline code\`}</code></p></div></div>"`)
  })
})
