import type { Entry } from './catalog.ts'
import { githubImportPath } from './catalog.ts'

export type HostedEditorTheme = 'light' | 'dark'

export interface HostedEditorEmbedOptions {
  openFile: string
  clickToLoad: false
  theme: HostedEditorTheme
  height: '100%'
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
): HostedEditorEmbedRequest {
  return {
    method: 'embedGithubProject',
    projectPath: githubImportPath(entry),
    options: {
      openFile: entry.focusedFile,
      clickToLoad: false,
      theme,
      height: '100%',
    },
  }
}
