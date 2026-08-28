declare module 'virtual:sveltepress/site' {
  const siteConfig: {
    title: string
    description: string
  }

  export default siteConfig
}

declare module 'virtual:sveltepress/versions' {
  import type { VersionManifest, VersionRuntime } from '@sveltepress/vite/versioning'

  export const manifest: VersionManifest | null
  export const changeSets: VersionRuntime['changeSets']
  export const resolveVersionChanges: VersionRuntime['resolveVersionChanges']
  export const resolveVersionContext: VersionRuntime['resolveVersionContext']
  export const resolveVersionedPath: VersionRuntime['resolveVersionedPath']
  export const resolveVersionSwitch: VersionRuntime['resolveVersionSwitch']
  const runtime: VersionRuntime
  export default runtime
}

declare module '*.md' {
  import type { SvelteComponentTyped } from 'svelte'

  const comp: SvelteComponentTyped
  export default comp
}
