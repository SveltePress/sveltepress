// @vitest-environment happy-dom

import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Home from '../src/components/Home.svelte'
import Feature from '../src/components/home/Feature.svelte'
import HeroCode from '../src/components/home/HeroCode.svelte'
import InstallCommand from '../src/components/home/InstallCommand.svelte'
import { setPage } from './fixtures/app-state.svelte'

beforeEach(() => {
  setPage('/')
  window.history.replaceState({}, '', '/')
})

afterEach(cleanup)

describe('home redesign components', () => {
  describe('installCommand component', () => {
    it('renders command text and copies to clipboard on click', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextMock,
        },
        configurable: true,
      })

      const view = render(InstallCommand, {
        command: 'pnpm create sveltepress',
      })

      expect(view.getByText('pnpm create sveltepress')).toBeTruthy()
      const copyButton = view.getByRole('button', { name: /copy/i })
      expect(copyButton).toBeTruthy()

      await fireEvent.click(copyButton)
      expect(writeTextMock).toHaveBeenCalledWith('pnpm create sveltepress')
    })
  })

  describe('feature component spotlight and tag support', () => {
    it('renders normal feature card without spotlight', () => {
      const view = render(Feature, {
        i: 0,
        title: 'Markdown Centered',
        description: 'Write docs with ease',
      })
      const card = view.container.querySelector('.feature-item')
      expect(card).toBeTruthy()
      expect(card?.classList.contains('spotlight')).toBe(false)
      expect(view.queryByText('Core')).toBeNull()
    })

    it('renders spotlight class and tag badge when configured', () => {
      const view = render(Feature, {
        i: 1,
        title: 'Svelte 5 in Markdown',
        description: 'Interactive components and runes',
        spotlight: true,
        tag: 'Highlight',
      })
      const card = view.container.querySelector('.feature-item')
      expect(card).toBeTruthy()
      expect(card?.classList.contains('spotlight')).toBe(true)
      expect(view.getByText('Highlight')).toBeTruthy()
    })
  })

  describe('home.svelte integration', () => {
    const siteConfig = {
      title: 'Sveltepress',
      description: 'Content centered site build tool',
    }

    it('renders announcement badge and install command when provided', () => {
      const view = render(Home, {
        siteConfig,
        badge: {
          text: '⚡️ Svelte 5 + Runes Support',
          link: '/guide/introduction/',
        },
        installCommand: 'pnpm create sveltepress',
        actions: [
          { label: 'Get Started', to: '/guide/' },
        ],
        features: [
          {
            title: 'Svelte in Markdown',
            description: 'Use runes inside markdown',
            spotlight: true,
            tag: 'Core',
          },
          {
            title: 'Version Management',
            description: 'Immutable documentation versions',
          },
        ],
      })

      // Badge check
      const badge = view.getByText('⚡️ Svelte 5 + Runes Support')
      expect(badge).toBeTruthy()
      const badgeLink = badge.closest('a')
      expect(badgeLink?.getAttribute('href')).toContain('/guide/introduction/')

      // Install command check
      expect(view.getByText('pnpm create sveltepress')).toBeTruthy()

      // Features check
      expect(view.getByText('Svelte in Markdown')).toBeTruthy()
      expect(view.getByText('Core')).toBeTruthy()
      expect(view.getByText('Version Management')).toBeTruthy()
    })

    it('remains backward compatible without badge or installCommand', () => {
      const view = render(Home, {
        siteConfig,
        actions: [
          { label: 'Read the docs', to: '/guide/' },
        ],
        features: [
          { title: 'Feature 1', description: 'Desc 1' },
        ],
      })

      expect(view.getByText('Read the docs')).toBeTruthy()
      expect(view.getByText('Feature 1')).toBeTruthy()
      expect(view.container.querySelector('.home-badge')).toBeNull()
      expect(view.container.querySelector('.install-command')).toBeNull()
    })
  })

  describe('herocode interactive showcase', () => {
    it('renders tabs and increments counter interactively in Runes tab', async () => {
      const view = render(HeroCode)

      const runesTab = view.getByRole('tab', { name: /runes/i })
      const calloutsTab = view.getByRole('tab', { name: /callouts/i })
      const twoslashTab = view.getByRole('tab', { name: /twoslash/i })

      expect(runesTab).toBeTruthy()
      expect(calloutsTab).toBeTruthy()
      expect(twoslashTab).toBeTruthy()

      // Interactive counter in render pane
      const counterBtn = view.getByRole('button', { name: /count:/i })
      expect(counterBtn.textContent).toContain('1')

      await fireEvent.click(counterBtn)
      expect(counterBtn.textContent).toContain('2')

      await fireEvent.click(counterBtn)
      expect(counterBtn.textContent).toContain('3')
    })

    it('switches content when clicking callouts and twoslash tabs', async () => {
      const view = render(HeroCode)

      const calloutsTab = view.getByRole('tab', { name: /callouts/i })
      await fireEvent.click(calloutsTab)

      expect(view.getByText(':::tip')).toBeTruthy()
      expect(view.getByText(/Pro Tip/)).toBeTruthy()

      const twoslashTab = view.getByRole('tab', { name: /twoslash/i })
      await fireEvent.click(twoslashTab)

      expect(view.getByText(/\/\/ \^\?/)).toBeTruthy()
      expect(view.getByText('interface')).toBeTruthy()
      expect(view.getAllByText('SiteConfig').length).toBeGreaterThan(0)
    })
  })
})
