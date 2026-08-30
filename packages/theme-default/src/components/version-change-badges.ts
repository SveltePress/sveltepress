export interface ActiveVersionBadgeContext {
  id: string
  label: string
}

const MARKER_SELECTOR = '[data-sveltepress-introduced-in]'

export function updateVersionChangeBadges(
  root: ParentNode,
  activeVersion: ActiveVersionBadgeContext | null | undefined,
): void {
  root.querySelectorAll<HTMLElement>(MARKER_SELECTOR).forEach((marker) => {
    const introducedIn = marker.dataset.sveltepressIntroducedIn
    const visible = Boolean(activeVersion && introducedIn === activeVersion.id)
    marker.hidden = !visible
    marker.textContent = visible
      ? (marker.dataset.sveltepressVersionLabelTemplate ?? 'New in __SVELTEPRESS_VERSION__')
          .replace('__SVELTEPRESS_VERSION__', activeVersion.label)
          .replace('{version}', activeVersion.label)
      : ''
    if (visible)
      marker.removeAttribute('aria-hidden')
    else
      marker.setAttribute('aria-hidden', 'true')
  })
}
