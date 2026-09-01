import type { VersionManifest } from '@sveltepress/vite/versioning'
import { createVersionRuntime } from '@sveltepress/vite/versioning'

export const manifest: VersionManifest = {
  basePath: '/v',
  current: {
    id: '2026-08-28',
    label: '2026-08-28',
    routes: ['/', '/guide/', '/guide/new/'],
    changes: {
      versionId: '2026-08-28',
      baselineVersionId: '2026-08-27',
      newPages: [{ route: '/guide/new/', title: 'New guide', summary: 'Start here', sections: [] }],
      updatedPages: [{
        route: '/guide/',
        title: 'Guide',
        sections: [{ id: 'hot-reload', title: 'Hot reload', introducedIn: '2026-08-28' }],
      }],
    },
  },
  versions: [{
    id: '2026-08-27',
    label: '2026-08-27',
    status: 'deprecated',
    routes: ['/', '/guide/', '/guide/legacy-new/'],
    changes: {
      versionId: '2026-08-27',
      baselineVersionId: '2026-08-26',
      newPages: [{ route: '/guide/legacy-new/', title: 'Legacy new page', sections: [] }],
      updatedPages: [],
    },
  }, {
    id: '2026-08-26',
    label: '2026-08-26',
    status: 'eol',
    routes: ['/', '/guide/'],
    changes: {
      versionId: '2026-08-26',
      baselineVersionId: null,
      newPages: [],
      updatedPages: [],
    },
  }],
  content: { include: ['**'], exclude: [], shared: [] },
}

export const manifests = { '/': manifest }
export const resolveVersionManifest = () => manifest

const runtime = createVersionRuntime(manifest)

export const resolveVersionContext = runtime.resolveVersionContext
export const changeSets = runtime.changeSets
export const resolveVersionChanges = runtime.resolveVersionChanges
export const resolveVersionedPath = runtime.resolveVersionedPath
export const resolveVersionSwitch = runtime.resolveVersionSwitch
export default runtime
