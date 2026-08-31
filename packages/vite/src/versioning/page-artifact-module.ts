import type { Plugin } from 'unified'
import type { Highlighter } from '../types.js'
import type { CompiledPageArtifact } from './artifact-store.js'
import { readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { compile } from 'svelte/compiler'
import { prepareSvelteContentComponent, wrapPage } from '../utils/wrap-page.js'
import { validateStoredPageArtifact } from './artifact-store.js'
import { createPageArtifactFileCollector } from './page-artifact-generated.js'

export const PAGE_ARTIFACT_VIRTUAL_PREFIX = 'virtual:sveltepress/page-artifact/'
export const PAGE_ARTIFACT_SOURCE_VIRTUAL_PREFIX = 'virtual:sveltepress/page-artifact-source/'
export const PAGE_ARTIFACT_MODULE_SCHEMA = 'page-module-v4'

export interface PageArtifactMetadata {
  route: string
  fm: Record<string, unknown>
  sourceFile: string
}

export async function compilePageArtifactModule(input: {
  filename: string
  source: string
  routesDirectory?: string
  siteRoot?: string
  highlighter?: Highlighter
  remarkPlugins?: Plugin[]
  rehypePlugins?: Plugin[]
  footnoteLabel?: string
}): Promise<CompiledPageArtifact> {
  const generated = createPageArtifactFileCollector()
  const routesDirectory = resolve(input.routesDirectory ?? inferRoutesDirectory(input.filename))
  const { wrappedCode, fm } = await wrapPage({
    id: input.filename,
    mdOrSvelteCode: input.source,
    highlighter: input.highlighter,
    remarkPlugins: input.remarkPlugins,
    rehypePlugins: input.rehypePlugins,
    footnoteLabel: input.footnoteLabel,
    data: generated.data,
  })
  const route = routeFromPageFilename(input.filename, routesDirectory)
  const siteRoot = resolve(input.siteRoot ?? inferSiteRoot(input.filename))
  const common = {
    filename: input.filename,
    css: 'injected' as const,
    dev: false,
  }
  const contentCode = prepareSvelteContentComponent({ svelteCode: wrappedCode, fm })
  const client = compile(contentCode, { ...common, generate: 'client' })
  const server = compile(contentCode, { ...common, generate: 'server' })
  const metadata: PageArtifactMetadata = {
    route,
    fm,
    sourceFile: relative(siteRoot, resolve(input.filename)).split(sep).join('/'),
  }
  return {
    files: {
      'client.js': client.js.code,
      'server.js': server.js.code,
      'metadata.json': `${JSON.stringify(metadata, null, 2)}\n`,
      ...generated.files,
    },
  }
}

export function createArtifactPageWrapper(input: {
  artifactHash: string
  fm: Record<string, unknown>
  pageLayout: string
}): string {
  return `<script>
  import PageLayout from '${input.pageLayout}'
  import Content from '${PAGE_ARTIFACT_VIRTUAL_PREFIX}${input.artifactHash}'
  const fm = ${JSON.stringify(input.fm)}
</script>

<!-- sveltepress:artifact-shell -->
<PageLayout {fm}><Content /></PageLayout>
`
}

export async function readPageArtifactMetadata(
  storeRoot: string,
  artifactHash: string,
): Promise<PageArtifactMetadata> {
  const descriptor = await validateStoredPageArtifact(storeRoot, artifactHash)
  const metadataFile = descriptor.files.find(file => file.path === 'metadata.json')
  if (!metadataFile)
    throw new Error(`[sveltepress:versions] Page artifact ${artifactHash} has no metadata.json.`)
  const metadata = JSON.parse(readFileSync(join(storeRoot, 'blobs', artifactHash, metadataFile.path), 'utf8'))
  if (!metadata || typeof metadata !== 'object' || typeof metadata.route !== 'string' || !metadata.fm || typeof metadata.fm !== 'object' || typeof metadata.sourceFile !== 'string')
    throw new Error(`[sveltepress:versions] Page artifact ${artifactHash} contains invalid metadata.`)
  if (metadata.route !== descriptor.route)
    throw new Error(`[sveltepress:versions] Page artifact ${artifactHash} metadata belongs to ${metadata.route}, not ${descriptor.route}.`)
  return metadata
}

export async function readPageArtifactModule(
  storeRoot: string,
  artifactHash: string,
  target: 'client' | 'server',
): Promise<string> {
  const descriptor = await validateStoredPageArtifact(storeRoot, artifactHash)
  const path = `${target}.js`
  if (!descriptor.files.some(file => file.path === path))
    throw new Error(`[sveltepress:versions] Page artifact ${artifactHash} has no ${path}.`)
  return readFileSync(join(storeRoot, 'blobs', artifactHash, path), 'utf8')
}

function inferRoutesDirectory(filename: string): string {
  const normalized = resolve(filename)
  const segments = normalized.split(sep)
  const srcIndex = segments.lastIndexOf('src')
  if (srcIndex !== -1 && segments[srcIndex + 1] === 'routes')
    return segments.slice(0, srcIndex + 2).join(sep) || sep
  throw new Error(`[sveltepress:versions] Cannot infer the routes directory for ${filename}.`)
}

function inferSiteRoot(filename: string): string {
  const routes = inferRoutesDirectory(filename)
  return dirname(dirname(routes))
}

export function routeFromPageFilename(filename: string, routesDirectory = inferRoutesDirectory(filename)): string {
  const pageDirectory = relative(routesDirectory, dirname(resolve(filename)))
    .split(sep)
    .filter(segment => segment && !/^\(.*\)$/.test(segment))
  return pageDirectory.length ? `/${pageDirectory.join('/')}/` : '/'
}
