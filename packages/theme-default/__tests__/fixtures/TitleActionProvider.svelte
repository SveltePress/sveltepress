<script>
  import { setContext } from 'svelte'
  import PageLayout from '../../src/components/PageLayout.svelte'
  import { TITLE_ROW_ACTION_KEY } from '../../src/context'

  let { action, fm } = $props()

  setContext(TITLE_ROW_ACTION_KEY, {
    get current() {
      return action
    },
  })
</script>

<PageLayout {fm} />
