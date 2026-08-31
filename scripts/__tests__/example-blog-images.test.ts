import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Window } from 'happy-dom'
import { beforeAll, describe, expect, it } from 'vitest'
import { initHighlighter } from '../../packages/theme-blog/src/highlighter.js'
import { parsePost } from '../../packages/theme-blog/src/parse-post.js'

const root = fileURLToPath(new URL('../../packages/example-blog', import.meta.url))
const postsDir = join(root, 'src', 'posts')
const posts = readdirSync(postsDir)
  .filter(name => name.endsWith('.md'))
  .map(name => ({ name, content: readFileSync(join(postsDir, name), 'utf8') }))

async function imageReferences(slug: string, content: string): Promise<string[]> {
  const { cover, contentHtml } = await parsePost(slug, content)
  const window = new Window()
  window.document.body.innerHTML = contentHtml

  const references = [
    cover,
    ...[...window.document.querySelectorAll('img')].map(img => img.getAttribute('src')),
  ].filter((url): url is string => url !== undefined && url !== null)

  window.close()
  return references
}

describe('example-blog images', () => {
  beforeAll(async () => {
    await initHighlighter()
  })

  it('recognizes quoted covers and reference-style Markdown images', async () => {
    const references = await imageReferences('fixture', `---
cover: "https://example.com/cover.jpg"
---

![Diagram][diagram]

[diagram]: /covers/diagram.svg
`)

    expect(references).toEqual([
      'https://example.com/cover.jpg',
      '/covers/diagram.svg',
    ])
  })

  it('has posts to inspect', () => {
    expect(posts.length).toBeGreaterThan(0)
  })

  it.each(posts)('serves $name images from this repository', async ({ name, content }) => {
    const external = (await imageReferences(name, content))
      .filter(url => /^(?:https?:)?\/\//.test(url))

    expect(external).toEqual([])
  })

  it.each(posts)('points $name at static files that exist', async ({ name, content }) => {
    const missing = (await imageReferences(name, content))
      .filter(url => url.startsWith('/'))
      .filter(url => !existsSync(join(root, 'static', url.slice(1))))

    expect(missing).toEqual([])
  })
})
