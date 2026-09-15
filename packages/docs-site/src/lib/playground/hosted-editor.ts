import type { CatalogLocale, Entry } from './catalog.ts'
import { focusedFileForLocale, githubImportPath, previewPathForLocale } from './catalog.ts'

export type HostedEditorTheme = 'light' | 'dark'

export interface HostedEditorEmbedOptions {
  openFile: string
  clickToLoad: false
  theme: HostedEditorTheme
  height: '100%'
  crossOriginIsolated: true
}

export interface HostedEditorEmbedRequest {
  method: 'embedGithubProject'
  projectPath: string
  options: HostedEditorEmbedOptions
  previewPath: string
}

export interface HostedEditorPreview {
  getUrl?: () => Promise<string | null>
  setUrl?: (path: string) => Promise<unknown>
}

export type HostedEditorEmbed = (
  element: string | HTMLElement,
  projectPath: string,
  options: HostedEditorEmbedOptions,
) => Promise<unknown>

export function hostedEditorEmbedRequest(
  entry: Entry,
  theme: HostedEditorTheme,
  locale: CatalogLocale = 'en',
): HostedEditorEmbedRequest {
  return {
    method: 'embedGithubProject',
    projectPath: githubImportPath(entry, locale),
    options: {
      openFile: focusedFileForLocale(entry, locale),
      clickToLoad: false,
      theme,
      height: '100%',
      crossOriginIsolated: true,
    },
    previewPath: previewPathForLocale(entry, locale),
  }
}

/**
 * StackBlitz's SDK does not forward `initialpath`. After the VM connects,
 * wait for a preview origin and open the Entry's example route when it is
 * not the site home.
 */
export async function applyHostedEditorPreview(
  vm: unknown,
  path: string,
  options: {
    signal?: AbortSignal
    wait?: (ms: number) => Promise<void>
  } = {},
): Promise<void> {
  if (!path || path === '/')
    return

  const preview = (vm as { preview?: HostedEditorPreview } | null | undefined)?.preview
  if (!preview?.setUrl)
    return

  const wait = options.wait ?? (ms => new Promise(resolve => setTimeout(resolve, ms)))

  for (let attempt = 0; attempt < 40; attempt++) {
    if (options.signal?.aborted)
      return
    let url: string | null = 'ready'
    try {
      url = preview.getUrl ? await preview.getUrl() : 'ready'
    }
    catch {
      url = null
    }
    if (options.signal?.aborted)
      return
    if (url) {
      try {
        await preview.setUrl(path)
      }
      catch {
        // Preview navigation is best-effort; a missing server must not fail boot.
      }
      return
    }
    await wait(500)
  }
}
