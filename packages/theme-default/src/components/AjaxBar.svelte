<script>
  import { onDestroy } from 'svelte'

  let barWidth = 0

  let startedFlag

  let interval = 200

  onDestroy(() => {
    if (startedFlag) clearTimeout(startedFlag)
  })

  /**
   * Start the ajax bar
   */
  export function start() {
    if (startedFlag) clearTimeout(startedFlag)
    barWidth = 0
    interval = 200
    const next = () => {
      barWidth += 1
      interval += Math.floor(Math.random() * 200)
      startedFlag = setTimeout(next, interval)
    }
    next()
  }

  /**
   * End the ajax bar
   */
  export function end() {
    if (barWidth > 0) barWidth = 100

    if (startedFlag) clearInterval(startedFlag)

    setTimeout(() => {
      barWidth = 0
    }, 100)
  }
</script>

<div class="ajax-bar" style={`--ajax-bar-width: ${barWidth}%;`}>
  <div class="progress"></div>
</div>

<style>
  .ajax-bar {
    --at-apply: fixed top-0 left-0 right-0 bottom-0 h-[3px] z-99999;
  }
  .progress {
    --at-apply: transition-width transition-100 bg-svp-primary h-full;
    width: var(--ajax-bar-width);
  }
</style>
