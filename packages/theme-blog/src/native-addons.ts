import process from 'node:process'

/**
 * WebContainers and `node --no-addons` disable `process.dlopen`.
 * Probe that restriction without loading a real native binding.
 */
export function canLoadNativeAddons(): boolean {
  if (typeof process.dlopen !== 'function')
    return false

  const versions = process.versions as NodeJS.ProcessVersions & { webcontainer?: string }
  if (versions.webcontainer)
    return false

  try {
    process.dlopen({ exports: Object.create(null) }, 'sveltepress-native-addon-probe.node')
    return true
  }
  catch (err) {
    return (err as NodeJS.ErrnoException).code !== 'ERR_DLOPEN_DISABLED'
  }
}
