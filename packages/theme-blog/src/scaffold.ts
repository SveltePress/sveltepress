import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  CAT_PAGE,
  CAT_PAGE_LOAD,
  LIST_PAGE,
  POST_PAGE,
  POST_PAGE_LOAD,
  ROOT_LAYOUT,
  ROOT_LAYOUT_TS,
  TAG_PAGE,
  TAG_PAGE_LOAD,
} from './route-templates.js'

interface ScaffoldFile {
  path: string
  content: string
}

function scaffoldFiles(root: string): ScaffoldFile[] {
  const r = (p: string) => join(root, 'src', 'routes', p)
  return [
    { path: r('+layout.ts'), content: ROOT_LAYOUT_TS },
    { path: r('+layout.svelte'), content: ROOT_LAYOUT },
    { path: r('+page.svelte'), content: LIST_PAGE },
    { path: r('posts/[slug]/+page.ts'), content: POST_PAGE_LOAD },
    { path: r('posts/[slug]/+page.svelte'), content: POST_PAGE },
    { path: r('tags/[tag]/+page.ts'), content: TAG_PAGE_LOAD },
    { path: r('tags/[tag]/+page.svelte'), content: TAG_PAGE },
    { path: r('categories/[cat]/+page.ts'), content: CAT_PAGE_LOAD },
    { path: r('categories/[cat]/+page.svelte'), content: CAT_PAGE },
  ]
}

/** Write route files that don't already exist. Logs each written file. */
export async function scaffoldRoutes(root: string): Promise<void> {
  for (const file of scaffoldFiles(root)) {
    if (existsSync(file.path))
      continue
    await mkdir(join(file.path, '..'), { recursive: true })
    await writeFile(file.path, file.content, 'utf-8')
    console.warn(`[theme-blog] scaffolded ${file.path.replace(root, '')}`)
  }
}
