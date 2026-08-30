import type { VFile } from 'vfile'
import { Buffer } from 'node:buffer'

export const PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX = 'virtual:sveltepress/page-artifact-generated/'

const PAGE_ARTIFACT_CONTEXT_DATA_KEY = 'sveltepressPageArtifactContext'

export interface PageArtifactGeneratedFile {
  path: string
  content: string | Uint8Array
}

interface PageArtifactCompileContext {
  emit: (file: PageArtifactGeneratedFile) => string
}

export function emitPageArtifactFile(vFile: VFile, file: PageArtifactGeneratedFile): string | null {
  const context = vFile.data?.[PAGE_ARTIFACT_CONTEXT_DATA_KEY] as PageArtifactCompileContext | undefined
  return context?.emit(file) ?? null
}

export function createPageArtifactFileCollector(): {
  data: Record<string, unknown>
  files: Record<string, string | Uint8Array>
} {
  const files: Record<string, string | Uint8Array> = {}
  const context: PageArtifactCompileContext = {
    emit(file) {
      const path = normalizeGeneratedPath(file.path)
      const artifactPath = `generated/${path}`
      const existing = files[artifactPath]
      if (existing !== undefined) {
        if (!Buffer.from(existing).equals(Buffer.from(file.content)))
          throw new Error(`[sveltepress:versions] Generated page artifact file ${path} was emitted with conflicting content.`)
      }
      else {
        files[artifactPath] = file.content
      }
      return `${PAGE_ARTIFACT_GENERATED_VIRTUAL_PREFIX}${path}`
    },
  }
  return {
    data: { [PAGE_ARTIFACT_CONTEXT_DATA_KEY]: context },
    files,
  }
}

export function withoutPageArtifactContext(data: Record<string, unknown>): Record<string, unknown> {
  const { [PAGE_ARTIFACT_CONTEXT_DATA_KEY]: _context, ...publicData } = data
  return publicData
}

function normalizeGeneratedPath(path: string): string {
  if (typeof path !== 'string' || !path || path.startsWith('/') || path.includes('\\') || path.includes('\0') || path.includes('?') || path.includes('#'))
    throw new Error('[sveltepress:versions] Generated page artifact path is unsafe; paths must be non-empty and relative POSIX paths.')
  const segments = path.split('/')
  if (segments.some(segment => !segment || segment === '.' || segment === '..'))
    throw new Error(`[sveltepress:versions] Generated page artifact path ${path} is unsafe.`)
  return path
}
