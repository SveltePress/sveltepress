import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OUTDATED_TAGS_INDEX_PAGE, TAGS_INDEX_PAGE } from '../src/route-templates.js'
import { scaffoldRoutes } from '../src/scaffold.js'

describe('scaffoldRoutes', () => {
  let root: string | undefined

  afterEach(() => {
    if (root)
      rmSync(root, { recursive: true, force: true })
    root = undefined
    vi.restoreAllMocks()
  })

  function createRoot(tagsIndex?: string) {
    root = mkdtempSync(join(tmpdir(), 'sveltepress-blog-scaffold-'))
    if (tagsIndex !== undefined) {
      mkdirSync(join(root, 'src/routes/tags'), { recursive: true })
      writeFileSync(join(root, 'src/routes/tags/+page.svelte'), tagsIndex)
    }
    return root
  }

  it('scaffolds a tags index that does not import `base` from `$app/paths` (removed in SvelteKit 3)', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = createRoot()
    await scaffoldRoutes(root)
    const tagsIndex = readFileSync(join(root, 'src/routes/tags/+page.svelte'), 'utf-8')
    expect(tagsIndex).toBe(TAGS_INDEX_PAGE)
    expect(tagsIndex).not.toContain('import { base }')
    expect(existsSync(join(root, 'src/routes/posts/[slug]/+page.svelte'))).toBe(true)
  })

  it('upgrades an unmodified tags index scaffolded by an earlier version', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = createRoot(OUTDATED_TAGS_INDEX_PAGE)
    await scaffoldRoutes(root)
    expect(readFileSync(join(root, 'src/routes/tags/+page.svelte'), 'utf-8')).toBe(TAGS_INDEX_PAGE)
  })

  it('keeps a customized tags index', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const customized = OUTDATED_TAGS_INDEX_PAGE.replace('All Tags', 'Topics')
    const root = createRoot(customized)
    await scaffoldRoutes(root)
    expect(readFileSync(join(root, 'src/routes/tags/+page.svelte'), 'utf-8')).toBe(customized)
  })
})
