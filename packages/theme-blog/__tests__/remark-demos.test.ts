import { beforeAll, describe, expect, it } from 'vitest'
import { initHighlighter } from '../src/highlighter.js'
import { parsePost } from '../src/parse-post.js'
import { parseTag } from '../src/remark-demos.js'

const POST = `---
title: Demos
date: 2026-11-05
---
<Chart />

Inline <Badge text="重要" type="" /> badge.

> <Spinner size="2" />

<Unknown />

<Install package-name="vite" dev />

\`\`\`html
<Chart />
\`\`\`
`

describe('remark-demos', () => {
  beforeAll(async () => {
    await initHighlighter()
  })

  it('turns tags of the project demos into placeholders, block or inline', async () => {
    const { contentHtml: html } = await parsePost('demos', POST, {
      demoNames: ['Chart', 'Badge', 'Spinner', 'Install'],
    })
    expect(html).toContain('<div class="sp-demo" data-demo="Chart"></div>')
    expect(html).toMatch(/Inline <span class="sp-demo" data-demo="Badge" data-props="\{&quot;text&quot;:&quot;重要&quot;,&quot;type&quot;:&quot;&quot;\}"><\/span> badge\./)
    expect(html).toContain('data-demo="Spinner" data-props="{&quot;size&quot;:&quot;2&quot;}"')
    expect(html).toContain('data-props="{&quot;packageName&quot;:&quot;vite&quot;,&quot;dev&quot;:true}"')
    // Not a project demo: left alone. Inside code: left alone.
    expect(html).toContain('<Unknown />')
    expect(html).toMatch(/<pre class="shiki[\s\S]*>Chart<\/span>/)
    expect(html.match(/data-demo="Chart"/g)).toHaveLength(1)
  })

  it('does nothing without demo names', async () => {
    const { contentHtml: html } = await parsePost('demos', POST)
    expect(html).not.toContain('sp-demo')
  })

  it('parses tags', () => {
    expect(parseTag('<A-b x="1" y=\'2\' z />')).toEqual({ name: 'A-b', props: { x: '1', y: '2', z: true } })
    expect(parseTag('<Box></Box>')).toEqual({ name: 'Box', props: {} })
    expect(parseTag('<br />')).toBeNull()
    expect(parseTag('<Box>text</Box>')).toBeNull()
  })
})
