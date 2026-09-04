import type { VersionManifest } from '@sveltepress/vite/versioning'
import { resolveLocale } from '@sveltepress/vite/locale'
import { createLocaleVersionRuntime } from '@sveltepress/vite/versioning/runtime'

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

function withBasePath(basePath: string): VersionManifest {
  return {
    ...manifest,
    basePath,
    current: { ...manifest.current },
    versions: manifest.versions.map(version => ({ ...version })),
  }
}

export const manifests = {
  '/': manifest,
  '/zh/': withBasePath('/zh/v'),
  '/bn/': withBasePath('/bn/v'),
  '/ja/': withBasePath('/ja/v'),
}

function localePrefix(pathname: string) {
  const locales = Object.fromEntries(
    Object.keys(manifests).map(prefix => [prefix, { lang: prefix, label: prefix, theme: {} }]),
  )
  return resolveLocale(pathname, locales)?.prefix ?? '/'
}

const runtime = createLocaleVersionRuntime(manifests, localePrefix)

export const resolveVersionManifest = runtime.resolveVersionManifest
export const resolveVersionContext = runtime.resolveVersionContext
export const changeSets = runtime.changeSets
export const resolveVersionChanges = runtime.resolveVersionChanges
export const resolveVersionedPath = runtime.resolveVersionedPath
export const resolveVersionSwitch = runtime.resolveVersionSwitch
export default runtime
