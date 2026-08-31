// @vitest-environment happy-dom

import { cleanup, render } from '@testing-library/svelte'
import { afterEach, describe, expect, it } from 'vitest'
import Toc, {
  createTocCircuit,
  getTocHeadingLevel,
} from '../src/components/Toc.svelte'

afterEach(cleanup)

describe('table of contents hierarchy circuit', () => {
  it('normalizes heading depths against the first supported TOC level', () => {
    expect([1, 2, 3, 4, 6].map(getTocHeadingLevel)).toEqual([0, 0, 1, 2, 4])
  })

  it('turns the guide line at every heading-depth transition', () => {
    const circuit = createTocCircuit([
      { slugId: 'root', title: 'Root', depth: 2 },
      { slugId: 'child', title: 'Child', depth: 3 },
      { slugId: 'grandchild', title: 'Grandchild', depth: 4 },
      { slugId: 'sibling', title: 'Sibling', depth: 3 },
      { slugId: 'next-root', title: 'Next root', depth: 2 },
    ])

    expect(circuit).toMatchObject({
      height: '10em',
      path: 'M0.5 0 L0.5 26 L10.5 38 L10.5 58 L20.5 70 L20.5 90 L10.5 102 L10.5 122 L0.5 134 L0.5 160',
      width: '1.375rem',
    })
    expect(circuit?.mask).toContain('viewBox%3D%220%200%2022%20160%22')
    expect(circuit?.mask).toContain('stroke%3D%22black%22')
  })

  it('keeps a single-level guide straight and omits empty guides', () => {
    expect(createTocCircuit([])).toBeNull()
    expect(
      createTocCircuit([{ slugId: 'only', title: 'Only', depth: 2 }]),
    ).toMatchObject({
      height: '2em',
      path: 'M0.5 0 L0.5 32',
      width: '0.75rem',
    })
  })

  it('keeps peer rows straight and supports skipped heading depths', () => {
    const circuit = createTocCircuit([
      { slugId: 'first', title: 'First', depth: 2 },
      { slugId: 'second', title: 'Second', depth: 2 },
      { slugId: 'deep', title: 'Deep', depth: 4 },
      { slugId: 'deep-peer', title: 'Deep peer', depth: 4 },
      { slugId: 'last', title: 'Last', depth: 2 },
    ])

    expect(circuit?.path).toBe(
      'M0.5 0 L0.5 32 L0.5 58 L20.5 70 L20.5 96 L20.5 122 L0.5 134 L0.5 160',
    )
  })

  it('renders one shared circuit mask for the full and active guide lines', () => {
    const view = render(Toc, {
      anchors: [
        { slugId: 'overview', title: 'Overview', depth: 2 },
        { slugId: 'details', title: 'Details', depth: 3 },
        { slugId: 'advanced', title: 'Advanced', depth: 4 },
      ],
    })
    const links = view.getAllByRole('link')

    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '#overview',
      '#details',
      '#advanced',
    ])
    expect(
      links.map(link => link.style.getPropertyValue('--heading-level')),
    ).toEqual(['0', '1', '2'])

    const indicator = view.container.querySelector<HTMLElement>(
      '.circuit-indicator',
    )
    expect(indicator).not.toBeNull()
    expect(indicator?.style.getPropertyValue('--circuit-mask')).toContain(
      'data:image/svg+xml',
    )
    expect(indicator?.querySelector('.circuit-line')).not.toBeNull()
    expect(indicator?.querySelector('.active-bar')).not.toBeNull()
  })
})
