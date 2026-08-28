import type { VersionManifest } from '@sveltepress/vite/versioning'
import { createVersionRuntime } from '@sveltepress/vite/versioning'

export const manifest: VersionManifest = {
  basePath: '/v',
  current: { id: '2026-08-28', label: '2026-08-28', routes: ['/', '/guide/', '/guide/new/'] },
  versions: [{
    id: '2026-08-27',
    label: '2026-08-27',
    status: 'deprecated',
    routes: ['/', '/guide/'],
  }],
  content: { include: ['**'], exclude: [], shared: [] },
}

const runtime = createVersionRuntime(manifest)

export const resolveVersionContext = runtime.resolveVersionContext
export const resolveVersionedPath = runtime.resolveVersionedPath
export const resolveVersionSwitch = runtime.resolveVersionSwitch
export default runtime
