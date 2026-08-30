// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest'
import { updateVersionChangeBadges } from '../src/components/version-change-badges'

function renderMarkers() {
  document.body.innerHTML = `
    <span
      hidden
      aria-hidden="true"
      data-sveltepress-introduced-in="v9"
      data-sveltepress-version-label-template="New in {version}"
    ></span>
    <span
      hidden
      aria-hidden="true"
      data-sveltepress-introduced-in="v8"
      data-sveltepress-version-label-template="Added in {version}"
    ></span>
  `
  return [...document.querySelectorAll<HTMLElement>('[data-sveltepress-introduced-in]')]
}

describe('version change badges', () => {
  it('shows and labels only markers introduced in the active version', () => {
    const [current, old] = renderMarkers()
    updateVersionChangeBadges(document, { id: 'v9', label: 'Version 9' })

    expect(current.hidden).toBe(false)
    expect(current.getAttribute('aria-hidden')).toBeNull()
    expect(current.textContent).toBe('New in Version 9')
    expect(old.hidden).toBe(true)
    expect(old.getAttribute('aria-hidden')).toBe('true')
    expect(old.textContent).toBe('')
  })

  it('resets reused DOM markers after navigating to another version', () => {
    const [current, old] = renderMarkers()
    updateVersionChangeBadges(document, { id: 'v9', label: 'Version 9' })
    updateVersionChangeBadges(document, { id: 'v8', label: 'Version 8' })

    expect(current.hidden).toBe(true)
    expect(current.textContent).toBe('')
    expect(old.hidden).toBe(false)
    expect(old.textContent).toBe('Added in Version 8')
  })

  it('hides every marker when there is no version context', () => {
    const markers = renderMarkers()
    updateVersionChangeBadges(document, null)
    expect(markers.every(marker => marker.hidden && marker.textContent === '')).toBe(true)
  })
})
