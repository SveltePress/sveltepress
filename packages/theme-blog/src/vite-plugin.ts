// src/vite-plugin.ts
import type { Plugin, ResolvedConfig } from 'vite'
import type { BlogThemeOptions } from './types.js'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { buildIndex, toVirtualModuleCode } from './build-index.js'
import { parsePost } from './parse-post.js'
import { generateRss } from './rss.js'
import { scaffoldRoutes } from './scaffold.js'

const VIRTUAL_POSTS = 'virtual:sveltepress/blog-posts'
const VIRTUAL_TAGS = 'virtual:sveltepress/blog-tags'
const VIRTUAL_CATEGORIES = 'virtual:sveltepress/blog-categories'

const RESOLVED = {
  POSTS: `\0${VIRTUAL_POSTS}`,
  TAGS: `\0${VIRTUAL_TAGS}`,
  CATEGORIES: `\0${VIRTUAL_CATEGORIES}`,
}

export function blogVitePlugin(options: BlogThemeOptions): Plugin {
  let config: ResolvedConfig
  let postsModule = 'export const posts = []'
  let tagsModule = 'export const tags = {}'
  let categoriesModule = 'export const categories = {}'

  async function rebuildIndex(root: string) {
    const postsDir = resolve(root, options.postsDir ?? 'src/posts')
    let files: string[] = []
    try {
      files = (await readdir(postsDir)).filter(f => f.endsWith('.md'))
    }
    catch {
      // postsDir doesn't exist yet — that's OK
    }

    const parsed = await Promise.all(
      files.map(async (file) => {
        const raw = await readFile(join(postsDir, file), 'utf-8')
        const slug = file.replace(/\.md$/, '')
        return parsePost(slug, raw)
      }),
    )

    const index = buildIndex(parsed)
    const modules = toVirtualModuleCode(index)
    postsModule = modules.postsModule
    tagsModule = modules.tagsModule
    categoriesModule = modules.categoriesModule
    return index
  }

  return {
    name: '@sveltepress/theme-blog',
    enforce: 'pre',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    async buildStart() {
      await scaffoldRoutes(config.root)
      const index = await rebuildIndex(config.root)

      if (options.rss?.enabled !== false) {
        const xml = generateRss(index.posts, {
          title: options.title,
          base: options.base ?? 'http://localhost',
          description: options.description,
          copyright: options.rss?.copyright,
          limit: options.rss?.limit ?? 20,
        })
        const staticDir = resolve(config.root, 'static')
        try {
          await writeFile(join(staticDir, 'rss.xml'), xml, 'utf-8')
        }
        catch {
          // static/ may not exist in all project setups
        }
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_POSTS)
        return RESOLVED.POSTS
      if (id === VIRTUAL_TAGS)
        return RESOLVED.TAGS
      if (id === VIRTUAL_CATEGORIES)
        return RESOLVED.CATEGORIES
    },

    load(id) {
      if (id === RESOLVED.POSTS)
        return postsModule
      if (id === RESOLVED.TAGS)
        return tagsModule
      if (id === RESOLVED.CATEGORIES)
        return categoriesModule
    },

    configureServer(server) {
      const postsDir = resolve(config.root, options.postsDir ?? 'src/posts')
      server.watcher.add(postsDir)

      const handlePostChange = async (file: string) => {
        if (!file.startsWith(postsDir + sep))
          return
        await rebuildIndex(config.root)
        const mods = [RESOLVED.POSTS, RESOLVED.TAGS, RESOLVED.CATEGORIES]
          .map(id => server.moduleGraph.getModuleById(id))
          .filter(Boolean)
        mods.forEach(mod => server.moduleGraph.invalidateModule(mod!))
        server.ws.send({ type: 'full-reload' })
      }

      server.watcher.on('change', handlePostChange)
      server.watcher.on('add', handlePostChange)
      server.watcher.on('unlink', handlePostChange)
    },
  }
}
