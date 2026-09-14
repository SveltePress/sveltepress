<script>
  import { page } from '$app/state'
  import { openInPlaygroundTitleAction } from '$lib/playground/copy.ts'
  import { TITLE_ROW_ACTION_KEY } from '@sveltepress/theme-default/context'
  import { setContext } from 'svelte'

  const { children } = $props()
  const action = $derived(
    openInPlaygroundTitleAction(page.url.pathname) ?? undefined,
  )

  setContext(TITLE_ROW_ACTION_KEY, {
    get current() {
      return action
    },
  })
</script>

{@render children?.()}
