import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { canLoadNativeAddons } from '../src/native-addons.js'

afterEach(() => {
  vi.restoreAllMocks()
  delete (process.versions as { webcontainer?: string }).webcontainer
})

describe('canLoadNativeAddons', () => {
  it('returns true in a native Node.js process', () => {
    expect(canLoadNativeAddons()).toBe(true)
  })

  it('returns false when Node disables native addons', () => {
    vi.spyOn(process, 'dlopen').mockImplementation(() => {
      throw Object.assign(new Error('Cannot load native addon because loading addons is disabled.'), {
        code: 'ERR_DLOPEN_DISABLED',
      })
    })
    expect(canLoadNativeAddons()).toBe(false)
  })

  it('returns false in WebContainers', () => {
    (process.versions as { webcontainer?: string }).webcontainer = '1.1.0'
    expect(canLoadNativeAddons()).toBe(false)
  })

  it('returns false under node --no-addons', () => {
    const result = spawnSync(
      process.execPath,
      ['--no-addons', '--input-type=module', '-e', `
        try {
          process.dlopen({ exports: Object.create(null) }, 'sveltepress-native-addon-probe.node')
          console.log('true')
        }
        catch (err) {
          console.log((err && err.code !== 'ERR_DLOPEN_DISABLED') ? 'true' : 'false')
        }
      `],
      { encoding: 'utf8' },
    )
    expect(result.status).toBe(0)
    expect(result.stdout.trim()).toBe('false')
  })
})
