import type { VersionManifest, VersionPluginOptions } from '@sveltepress/vite'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadVersionManifest } from '@sveltepress/vite/versioning'

export function createVersionManifestReader(
  siteRoot: string,
  getOptions: () => VersionPluginOptions,
): () => VersionManifest | null {
  let fingerprint: string | null = null
  let manifest: VersionManifest | null = null
  return () => {
    const options = getOptions()
    if (options === false)
      return null
    const manifestFile = options?.manifest ?? 'sveltepress.versions.json'
    const path = resolve(siteRoot, manifestFile)
    if (existsSync(path)) {
      const nextFingerprint = fileFingerprint(path)
      if (nextFingerprint !== fingerprint) {
        fingerprint = nextFingerprint
        manifest = loadVersionManifest(siteRoot, manifestFile)
      }
      return manifest
    }
    try {
      if (existsSync(siteRoot)) {
        const files = readdirSync(siteRoot)
        const localeManifest = files.find(file => /^sveltepress\.versions\.[a-z0-9-]+\.json$/.test(file))
        if (localeManifest) {
          const localePath = resolve(siteRoot, localeManifest)
          const nextFingerprint = fileFingerprint(localePath)
          if (nextFingerprint !== fingerprint) {
            fingerprint = nextFingerprint
            manifest = loadVersionManifest(siteRoot, localeManifest)
          }
          return manifest
        }
      }
    }
    catch {
      // ignore directory read errors
    }
    return null
  }
}

function fileFingerprint(path: string): string {
  const stats = statSync(path, { bigint: true })
  return `${stats.mtimeNs}:${stats.size}`
}
