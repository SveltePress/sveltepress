import { describe, expect, it } from 'vitest'
import { paginationWindow } from '../src/pagination.js'

describe('paginationWindow', () => {
  it('returns all numbers when total pages ≤ 7', () => {
    expect(paginationWindow(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('shows ellipsis near the end', () => {
    expect(paginationWindow(1, 20)).toEqual([1, 2, 3, 4, 5, '…', 20])
  })

  it('shows ellipsis near the start', () => {
    expect(paginationWindow(20, 20)).toEqual([1, '…', 16, 17, 18, 19, 20])
  })

  it('shows ellipses on both sides when in middle', () => {
    expect(paginationWindow(10, 20)).toEqual([1, '…', 8, 9, 10, 11, 12, '…', 20])
  })

  it('inlines a single hidden page instead of emitting a useless ellipsis', () => {
    expect(paginationWindow(5, 20)).toEqual([1, 2, 3, 4, 5, 6, 7, '…', 20])
    expect(paginationWindow(16, 20)).toEqual([1, '…', 14, 15, 16, 17, 18, 19, 20])
  })
})
