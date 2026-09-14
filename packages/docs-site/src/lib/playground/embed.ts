import type { HostedEditorEmbed } from './hosted-editor.ts'

interface StackBlitzClient {
  embedGithubProject: HostedEditorEmbed
}

export const embedGithubProject: HostedEditorEmbed = async (
  element,
  projectPath,
  options,
) => {
  const mod = await import('@stackblitz/sdk') as unknown as { default: StackBlitzClient }
  return mod.default.embedGithubProject(element, projectPath, options)
}
