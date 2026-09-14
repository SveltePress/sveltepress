// @vitest-environment happy-dom

import { cleanup, render } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import PageLayout from '../src/components/PageLayout.svelte'
import { setPage } from './fixtures/app-state.svelte'
import TitleActionProvider from './fixtures/TitleActionProvider.svelte'

function actionSnippet(href = '/playground/markdown/basic-writing/') {
  return createRawSnippet(() => ({
    render: () => `<a href="${href}">Open in Playground</a>`,
  }))
}

beforeEach(() => {
  setPage('/guide/markdown/basic-writing/')
})

afterEach(() => {
  cleanup()
})

describe('pageLayout title-row action', () => {
  it('leaves today\'s title row when no action is provided', () => {
    const view = render(PageLayout, {
      fm: { title: 'Basic writing', pageType: 'md' },
    })
    const heading = view.getByRole('heading', { level: 1, name: 'Basic writing' })
    expect(heading.textContent?.trim()).toBe('Basic writing')
    expect(view.queryByRole('link', { name: 'Open in Playground' })).toBeNull()
  })

  it('renders the provided action on the h1 row after the title', () => {
    const view = render(PageLayout, {
      fm: { title: 'Basic writing', pageType: 'md' },
      titleAction: actionSnippet(),
    })
    const heading = view.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('Basic writing')
    const link = view.getByRole('link', { name: 'Open in Playground' })
    expect(heading.contains(link)).toBe(true)
    expect(link.getAttribute('href')).toBe('/playground/markdown/basic-writing/')
    expect(heading.textContent?.indexOf('Basic writing')).toBeLessThan(
      heading.textContent?.indexOf('Open in Playground') ?? -1,
    )
  })

  it('places the action after the version-new badge on the h1 row', () => {
    setPage('/guide/new/')
    const view = render(TitleActionProvider, {
      action: {
        href: '/playground/vite-plugin/',
        label: 'Open in Playground',
      },
      fm: { title: 'New guide', pageType: 'md' },
    })
    const heading = view.getByRole('heading', { level: 1 })
    const text = heading.textContent ?? ''
    expect(text).toContain('New guide')
    expect(text).toContain('新增于 2026-08-28')
    expect(text).toContain('Open in Playground')
    expect(text.indexOf('New guide')).toBeLessThan(text.indexOf('新增于 2026-08-28'))
    expect(text.indexOf('新增于 2026-08-28')).toBeLessThan(text.indexOf('Open in Playground'))
    expect(heading.contains(view.getByRole('link', { name: 'Open in Playground' }))).toBe(true)
    expect(view.getByRole('link', { name: 'Open in Playground' }).getAttribute('href')).toBe(
      '/playground/vite-plugin/',
    )
  })

  it('renders a title-row action supplied through TITLE_ROW_ACTION_KEY', () => {
    const view = render(TitleActionProvider, {
      action: {
        href: '/bn/playground/markdown/basic-writing/',
        label: 'প্লেগ্রাউন্ডে খুলুন',
      },
      fm: { title: 'হাতেখড়ি', pageType: 'md' },
    })
    const heading = view.getByRole('heading', { level: 1 })
    const link = view.getByRole('link', { name: 'প্লেগ্রাউন্ডে খুলুন' })
    expect(heading.contains(link)).toBe(true)
    expect(link.getAttribute('href')).toBe('/bn/playground/markdown/basic-writing/')
  })
})
