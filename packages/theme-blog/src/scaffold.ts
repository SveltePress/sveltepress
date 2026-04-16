import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  CAT_PAGE,
  CAT_PAGE_SERVER_LOAD,
  LIST_PAGE,
  LIST_PAGE_SERVER_LOAD,
  PAGE_N_PAGE,
  PAGE_N_SERVER_LOAD,
  POST_PAGE,
  POST_PAGE_SERVER_LOAD,
  ROOT_LAYOUT,
  ROOT_LAYOUT_TS,
  TAG_PAGE,
  TAG_PAGE_SERVER_LOAD,
  TAGS_INDEX_PAGE,
  TIMELINE_PAGE,
} from './route-templates.js'

interface ScaffoldFile {
  path: string
  content: string
}

/** Files created by earlier versions of theme-blog that reference dead
 * virtual module IDs or use client-side loads. Remove before re-scaffolding
 * so the fresh templates get written. */
const LEGACY_PATHS = [
  // Client-side loads replaced by +page.server.ts
  'src/routes/posts/[slug]/+page.ts',
  'src/routes/tags/[tag]/+page.ts',
  'src/routes/categories/[cat]/+page.ts',
  // .svelte files that imported dead virtual module IDs
  'src/routes/+page.svelte',
  'src/routes/timeline/+page.svelte',
  'src/routes/tags/+page.svelte',
]

function scaffoldFiles(root: string): ScaffoldFile[] {
  const r = (p: string) => join(root, 'src', 'routes', p)
  return [
    { path: r('+layout.ts'), content: ROOT_LAYOUT_TS },
    { path: r('+layout.svelte'), content: ROOT_LAYOUT },
    { path: r('+page.server.ts'), content: LIST_PAGE_SERVER_LOAD },
    { path: r('+page.svelte'), content: LIST_PAGE },
    { path: r('page/[n]/+page.server.ts'), content: PAGE_N_SERVER_LOAD },
    { path: r('page/[n]/+page.svelte'), content: PAGE_N_PAGE },
    { path: r('posts/[slug]/+page.server.ts'), content: POST_PAGE_SERVER_LOAD },
    { path: r('posts/[slug]/+page.svelte'), content: POST_PAGE },
    { path: r('tags/+page.svelte'), content: TAGS_INDEX_PAGE },
    { path: r('tags/[tag]/+page.server.ts'), content: TAG_PAGE_SERVER_LOAD },
    { path: r('tags/[tag]/+page.svelte'), content: TAG_PAGE },
    { path: r('categories/[cat]/+page.server.ts'), content: CAT_PAGE_SERVER_LOAD },
    { path: r('categories/[cat]/+page.svelte'), content: CAT_PAGE },
    { path: r('timeline/+page.svelte'), content: TIMELINE_PAGE },
  ]
}

/** Write route files that don't already exist. Removes known legacy files
 * so they get re-scaffolded with current templates. */
export async function scaffoldRoutes(root: string): Promise<void> {
  for (const legacy of LEGACY_PATHS) {
    const p = join(root, legacy)
    if (existsSync(p)) {
      await rm(p)
      console.warn(`[theme-blog] removed legacy scaffold file ${legacy}`)
    }
  }
  for (const file of scaffoldFiles(root)) {
    if (existsSync(file.path))
      continue
    await mkdir(join(file.path, '..'), { recursive: true })
    await writeFile(file.path, file.content, 'utf-8')
    console.warn(`[theme-blog] scaffolded ${file.path.replace(root, '')}`)
  }
}
