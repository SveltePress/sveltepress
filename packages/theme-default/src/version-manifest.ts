import type { VersionManifest, VersionPluginOptions } from '@sveltepress/vite'
import { existsSync, statSync } from 'node:fs'
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
    const nextFingerprint = existsSync(path)
      ? fileFingerprint(path)
      : 'missing'
    if (nextFingerprint !== fingerprint) {
      fingerprint = nextFingerprint
      manifest = loadVersionManifest(siteRoot, manifestFile)
    }
    return manifest
  }
}

function fileFingerprint(path: string): string {
  const stats = statSync(path, { bigint: true })
  return `${stats.mtimeNs}:${stats.size}`
}
