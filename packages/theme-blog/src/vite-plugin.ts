// src/vite-plugin.ts
import type { Plugin, ResolvedConfig } from 'vite'
import type { Cache } from './parse-cache.js'
import type { BlogThemeOptions } from './types.js'
import type { VirtualModules } from './virtual-modules.js'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { initHighlighter } from './highlighter.js'
import { hashContent, loadCache, saveCache } from './parse-cache.js'
import { parsePost } from './parse-post.js'
import { generateRss } from './rss.js'
import { scaffoldRoutes } from './scaffold.js'
import { buildVirtualModules } from './virtual-modules.js'

const V_META = 'virtual:sveltepress/blog-posts-meta'
const V_POST_PREFIX = 'virtual:sveltepress/blog-post/'
const V_TAGS_INDEX = 'virtual:sveltepress/blog-tags-index'
const V_TAG_PREFIX = 'virtual:sveltepress/blog-tag/'
const V_CATS_INDEX = 'virtual:sveltepress/blog-categories-index'
const V_CAT_PREFIX = 'virtual:sveltepress/blog-category/'
const V_CONFIG = 'virtual:sveltepress/blog-config'
const V_RUNTIME = 'virtual:sveltepress/blog-runtime'

const VIRTUAL_PREFIX = '\0virtual:sveltepress/blog-'

export function blogVitePlugin(options: BlogThemeOptions): Plugin {
  let config: ResolvedConfig
  let modules: VirtualModules | null = null
  let cache: Cache = {}

  async function rebuildIndex(root: string) {
    const postsDir = resolve(root, options.postsDir ?? 'src/posts')
    let files: string[] = []
    try {
      files = (await readdir(postsDir)).filter(f => f.endsWith('.md'))
    }
    catch {
      // postsDir doesn't exist yet — that's OK
    }

    const next: Cache = {}
    const parsed = await Promise.all(
      files.map(async (file) => {
        const raw = await readFile(join(postsDir, file), 'utf-8')
        const slug = file.replace(/\.md$/, '')
        const hash = hashContent(raw, options.highlighter)
        const existing = cache[slug]
        if (existing && existing.hash === hash) {
          next[slug] = existing
          return existing.parsed
        }
        const p = await parsePost(slug, raw)
        next[slug] = { hash, parsed: p }
        return p
      }),
    )

    cache = next
    await saveCache(root, cache)
    modules = buildVirtualModules(parsed)

    // Write per-slug JSON files for +page.server.ts loads to read.
    // SvelteKit's prerender can't reliably resolve virtual modules through
    // dynamic import() expressions with template-string slugs, so posts go
    // to disk.
    const postsJsonDir = resolve(root, '.sveltepress/posts')
    await mkdir(postsJsonDir, { recursive: true })
    const keep = new Set(Object.keys(modules.postRecordBySlug).map(s => `${s}.json`))
    const existing = await readdir(postsJsonDir).catch(() => [] as string[])
    await Promise.all([
      ...existing
        .filter(f => f.endsWith('.json') && !keep.has(f))
        .map(f => rm(join(postsJsonDir, f))),
      ...Object.entries(modules.postRecordBySlug).map(([slug, record]) =>
        writeFile(join(postsJsonDir, `${slug}.json`), JSON.stringify(record), 'utf-8'),
      ),
    ])

    return parsed
  }

  return {
    name: '@sveltepress/theme-blog',
    enforce: 'pre',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    async buildStart() {
      await initHighlighter(options.highlighter)
      await scaffoldRoutes(config.root)
      cache = await loadCache(config.root)

      // Inject anti-FOWT theme-init script into app.html.
      // SvelteKit doesn't call transformIndexHtml during prerender, so we
      // must patch the template directly before SvelteKit reads it.
      const THEME_MARKER = '<!-- sp-blog-theme-init -->'
      const appHtmlPath = resolve(config.root, 'src/app.html')
      try {
        let html = await readFile(appHtmlPath, 'utf-8')
        if (!html.includes(THEME_MARKER)) {
          const mode = options.defaultMode ?? 'system'
          const script = [
            THEME_MARKER,
            '<script>',
            '(function(){',
            `var s=localStorage.getItem('sp-blog-theme');`,
            `var p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';`,
            `var m=${JSON.stringify(mode)};`,
            `document.documentElement.dataset.theme=s||(m==='system'?p:m);`,
            '})()',
            '</script>',
          ].join('')
          html = html.replace('<head>', `<head>\n    ${script}`)
          await writeFile(appHtmlPath, html, 'utf-8')
          console.warn('[theme-blog] injected theme-init script into src/app.html')
        }
      }
      catch {
        // app.html doesn't exist yet — that's OK
      }

      const parsed = await rebuildIndex(config.root)

      if (options.rss?.enabled !== false) {
        const xml = generateRss(parsed.filter(p => !p.draft), {
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
      if (id === V_META || id === V_TAGS_INDEX || id === V_CATS_INDEX || id === V_CONFIG || id === V_RUNTIME)
        return `\0${id}`
      if (id.startsWith(V_POST_PREFIX) || id.startsWith(V_TAG_PREFIX) || id.startsWith(V_CAT_PREFIX))
        return `\0${id}`
    },

    load(id) {
      if (!id.startsWith('\0'))
        return
      const key = id.slice(1)
      if (key === V_CONFIG)
        return `export const blogConfig = ${JSON.stringify(options)}`
      if (key === V_RUNTIME) {
        const postsJsonDir = resolve(config.root, '.sveltepress/posts')
        return `export const postsJsonDir = ${JSON.stringify(postsJsonDir)}`
      }
      if (key === V_META)
        return modules?.metaModule ?? 'export const posts = []'
      if (key === V_TAGS_INDEX)
        return modules?.tagsIndexModule ?? 'export const tags = []'
      if (key === V_CATS_INDEX)
        return modules?.categoriesIndexModule ?? 'export const categories = []'
      if (key.startsWith(V_POST_PREFIX))
        return modules?.postModule(decodeURIComponent(key.slice(V_POST_PREFIX.length))) ?? 'export const post = null'
      if (key.startsWith(V_TAG_PREFIX))
        return modules?.tagModule(decodeURIComponent(key.slice(V_TAG_PREFIX.length))) ?? 'export const posts = []'
      if (key.startsWith(V_CAT_PREFIX))
        return modules?.categoryModule(decodeURIComponent(key.slice(V_CAT_PREFIX.length))) ?? 'export const posts = []'
    },

    configureServer(server) {
      const postsDir = resolve(config.root, options.postsDir ?? 'src/posts')
      server.watcher.add(postsDir)

      const handlePostChange = async (file: string) => {
        if (!file.startsWith(postsDir + sep))
          return
        await rebuildIndex(config.root)
        const toInvalidate = Array.from(server.moduleGraph.idToModuleMap.keys())
          .filter(id => id.startsWith(VIRTUAL_PREFIX))
        toInvalidate.forEach((id) => {
          const mod = server.moduleGraph.getModuleById(id)
          if (mod)
            server.moduleGraph.invalidateModule(mod)
        })
        server.ws.send({ type: 'full-reload' })
      }

      server.watcher.on('change', handlePostChange)
      server.watcher.on('add', handlePostChange)
      server.watcher.on('unlink', handlePostChange)
    },

    // NOTE: transformIndexHtml is NOT used because SvelteKit's prerender
    // pipeline doesn't call it. The anti-FOWT script is injected into
    // app.html via buildStart instead.
  }
}
