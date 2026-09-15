import type { CatalogLocale, Entry } from './catalog.ts'
import { focusedFileForLocale, githubImportPath } from './catalog.ts'

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
    projectPath: githubImportPath(entry),
    options: {
      openFile: focusedFileForLocale(entry, locale),
      clickToLoad: false,
      theme,
      height: '100%',
      crossOriginIsolated: true,
    },
  }
}
