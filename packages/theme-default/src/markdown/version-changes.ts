import type { VersionManifest } from '@sveltepress/vite/versioning'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

interface VersionChangesOptions {
  manifest?: VersionManifest | null
  getManifest?: () => VersionManifest | null | undefined
  newLabel?: string
}

export default function versionChanges(options: VersionChangesOptions): Plugin {
  return () => (tree, file) => {
    const manifest = options.getManifest?.() ?? options.manifest
    if (!manifest)
      return
    const pageVersionId = resolvePageVersion(String(file.path ?? file.history?.[0] ?? ''), manifest)
    const versions = [manifest.current, ...manifest.versions]

    visit(tree, (node: any, index: number | undefined, parent: any) => {
      if (node.type !== 'containerDirective' || node.name !== 'since' || index === undefined || !parent)
        return
      const [label, ...content] = node.children ?? []
      const title = label?.data?.directiveLabel
        ? label.children?.map((child: any) => child.value ?? '').join('').trim()
        : ''
      const introducedIn = node.attributes?.version
      const id = node.attributes?.id
      const version = versions.find(candidate => candidate.id === introducedIn)
      const showBadge = introducedIn === pageVersionId
      const badgeText = (options.newLabel ?? 'New in {version}').replace('{version}', version?.label ?? introducedIn ?? '')
      const headingChildren: any[] = []
      if (showBadge) {
        headingChildren.push({
          type: 'versionChangeBadge',
          data: {
            hName: 'span',
            hProperties: {
              className: 'version-new-badge inline-flex items-center rounded-full bg-rose-50 dark:bg-rose-950/45 px-2.5 py-1 text-xs font-700 text-svp-primary-deep dark:text-svp-primary',
            },
          },
          children: [{ type: 'text', value: badgeText }],
        })
      }
      headingChildren.push({
        type: 'versionChangeTitle',
        data: { hName: 'strong' },
        children: [{ type: 'text', value: title }],
      })
      parent.children.splice(index, 1, {
        type: 'versionChangeSection',
        data: {
          hName: 'section',
          hProperties: {
            id,
            tabIndex: -1,
            className: 'version-change-section my-6 rounded-lg b-1 b-solid b-black/8 dark:b-white/10 p-4 scroll-mt-24',
          },
        },
        children: [
          {
            type: 'versionChangeHeading',
            data: {
              hName: 'div',
              hProperties: { className: 'version-change-heading mb-2 flex flex-wrap items-center gap-2' },
            },
            children: headingChildren,
          },
          ...(label?.data?.directiveLabel ? content : node.children),
        ],
      })
    })
  }
}

function resolvePageVersion(filename: string, manifest: VersionManifest): string {
  const normalized = filename.replaceAll('\\', '/')
  const prefix = `/src/routes/${manifest.basePath.slice(1)}/`
  const start = normalized.indexOf(prefix)
  if (start === -1)
    return manifest.current.id
  const versionId = normalized.slice(start + prefix.length).split('/')[0]
  return manifest.versions.some(version => version.id === versionId)
    ? versionId
    : manifest.current.id
}
