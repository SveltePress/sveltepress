import { beforeAll, describe, expect, it } from 'vitest'
import { initHighlighter } from '../src/highlighter.js'
import { parsePost } from '../src/parse-post.js'

const POST = `---
title: Tabs
date: 2026-11-05
---
Intro.

::::code-tabs{active="vite.config.js"}
### vue.config.js

\`\`\`js
module.exports = {}
\`\`\`

### vite.config.js

\`\`\`js
export default {}
\`\`\`

> a note under the code

::::

## Nested

:::::code-tabs{active="vue2" hide-copy}
### vue2

::::code-tabs{active="子组件" vertical}
#### 子组件

\`\`\`vue
<template></template>
\`\`\`

#### 父组件

![shot](/images/a.png)
::::

### vue3

\`\`\`vue
<p>3</p>
\`\`\`
:::::
`

describe('remark-code-tabs', () => {
  beforeAll(async () => {
    await initHighlighter()
  })

  it('turns a code-tabs container into one panel per heading', async () => {
    const { contentHtml: html } = await parsePost('tabs', POST)
    expect(html).toContain('<div class="sp-code-tabs" data-active="vite.config.js">')
    expect(html).toContain('<div class="sp-code-tabs__src" data-label="vue.config.js">')
    expect(html).toContain('<div class="sp-code-tabs__src" data-label="vite.config.js">')
    // Panels go through the normal pipeline: code is highlighted, and a
    // panel keeps everything up to the next tab heading.
    expect(html).toMatch(/data-label="vite\.config\.js">[\s\S]*svp-code-block[\s\S]*<blockquote>[\s\S]*a note under the code/)
    // Tab labels are not headings, so they stay out of the TOC.
    expect(html).not.toMatch(/<h3[^>]*>vue\.config\.js/)
    expect(html).toContain('<h2 id=')
  })

  it('supports nesting, vertical and hide-copy', async () => {
    const { contentHtml: html } = await parsePost('tabs', POST)
    expect(html).toContain('<div class="sp-code-tabs" data-active="vue2" data-hide-copy>')
    expect(html).toContain('<div class="sp-code-tabs" data-active="子组件" data-vertical>')
    expect(html).toMatch(/data-label="vue2">\s*<div class="sp-code-tabs" data-active="子组件"/)
    expect(html).toContain('data-label="父组件"')
    expect(html).toContain('data-label="vue3"')
    expect(html).not.toContain('::::')
  })

  it('keeps code out of the auto excerpt and decodes entities', async () => {
    const raw = '---\ntitle: Code\ndate: 2026-11-05\n---\n> Two <b>rects</b> & a "canvas"\n\n```html\n<canvas width="200"></canvas>\n```\n\nAfter the code.\n'
    const result = await parsePost('code', raw)
    expect(result.excerpt).toBe('Two rects & a "canvas" After the code.')
  })

  it('defaults the active tab to the first one', async () => {
    const { contentHtml: html } = await parsePost('t', `::::code-tabs\n### a\n\n\`\`\`js\n1\n\`\`\`\n### b\n\n\`\`\`js\n2\n\`\`\`\n::::\n`)
    expect(html).toContain('<div class="sp-code-tabs" data-active="a">')
  })
})
