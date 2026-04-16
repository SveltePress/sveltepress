<!-- src/components/ThemeToggle.svelte -->
<script lang="ts">
  let theme = $state<'dark' | 'light'>('dark')

  $effect(() => {
    // Read the value set by the anti-FOWT inline script
    const current = document.documentElement.dataset.theme as 'dark' | 'light'
    theme = current ?? 'dark'

    // Follow OS preference changes when the user hasn't manually chosen
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function onOsChange(e: MediaQueryListEvent) {
      if (!localStorage.getItem('sp-blog-theme')) {
        theme = e.matches ? 'dark' : 'light'
        document.documentElement.dataset.theme = theme
      }
    }
    mq.addEventListener('change', onOsChange)
    return () => mq.removeEventListener('change', onOsChange)
  })

  function toggle() {
    theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    localStorage.setItem('sp-blog-theme', theme)
  }
</script>

<button
  class="sp-theme-toggle"
  onclick={toggle}
  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {#if theme === 'dark'}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5" /><line
        x1="12"
        y1="1"
        x2="12"
        y2="3"
      /><line x1="12" y1="21" x2="12" y2="23" /><line
        x1="4.22"
        y1="4.22"
        x2="5.64"
        y2="5.64"
      /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line
        x1="1"
        y1="12"
        x2="3"
        y2="12"
      /><line x1="21" y1="12" x2="23" y2="12" /><line
        x1="4.22"
        y1="19.78"
        x2="5.64"
        y2="18.36"
      /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  {:else}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  {/if}
</button>

<style>
  .sp-theme-toggle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--sp-blog-border);
    background: transparent;
    color: var(--sp-blog-content);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background 0.15s,
      color 0.15s;
    flex-shrink: 0;
  }
  .sp-theme-toggle:hover {
    background: var(--sp-blog-surface);
    color: var(--sp-blog-primary);
  }
</style>
