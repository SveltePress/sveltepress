<script lang="ts">
  import type { Entry } from './_catalog'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { ENTRIES, GROUPS } from './_catalog'
  import { playgroundHref } from './_prototype'

  let { current }: { current: Entry | null } = $props()

  function onChange(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value
    void goto(playgroundHref(value || null, page.url), { noScroll: true })
  }
</script>

<label class="switch">
  <span class="sr">Switch Entry</span>
  <select onchange={onChange} value={current?.slug ?? ''}>
    <option value="">Playground home</option>
    {#each GROUPS as group}
      <optgroup label={group}>
        {#each ENTRIES.filter(entry => entry.group === group) as entry}
          <option value={entry.slug}>{entry.name}</option>
        {/each}
      </optgroup>
    {/each}
  </select>
</label>

<style>
  .switch {
    --at-apply: 'inline-flex items-center min-w-0';
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
  select {
    --at-apply: 'max-w-full h-8 px-2 rounded-md text-[12px] bg-white dark:bg-[#202023] b-1 b-solid b-black/12 dark:b-white/12 text-inherit';
  }
</style>
