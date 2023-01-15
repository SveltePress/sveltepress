<script>
  import { onDestroy } from 'svelte'

  let barWidth = 0

  let startedFlag

  onDestroy(() => {
    if (startedFlag)
      clearInterval(startedFlag)
  })

  /**
   * Start the ajax bar
   */
  export const start = () => {
    barWidth = 0
    if (startedFlag)
      clearInterval(startedFlag)
  
    startedFlag = setInterval(() => {
      barWidth += 1
    }, 200)
  }

  /**
   * End the ajax bar
   */
  export const end = () => {
    if (barWidth > 0)
      barWidth = 100
  
    if (startedFlag)
      clearInterval(startedFlag)
  
    setTimeout(() => {
      barWidth = 0
    }, 100)
  }
</script>

<div 
  class="ajax-bar" 
  style={`--ajax-bar-width: ${barWidth}%;`}
>
  <div class="progress"></div>
</div>

<style>
  .ajax-bar {
    --at-apply: fixed top-0 left-0 right-0 bottom-0 h-[3px] z-99999; 
  }
  .progress {
    --at-apply: transition-width transition-100 bg-rose-4 h-full;
    width: var(--ajax-bar-width);
  }
</style>