<script lang="ts">
  import type { CatalogLocale, Entry } from './catalog.ts'
  import { goto } from '$app/navigation'
  import { entryUrl, localizedName, playgroundHomeUrl } from './catalog.ts'
  import { localizedGroup, playgroundCopy } from './copy.ts'
  import { shippingEntriesInGroup, shippingGroups } from './shipping.ts'

  let {
    current,
    locale,
  }: {
    current: Entry
    locale: CatalogLocale
  } = $props()

  const copy = $derived(playgroundCopy(locale))
  const groups = $derived(shippingGroups())

  function onChange(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value
    const href = value ? entryUrl(value, locale) : playgroundHomeUrl(locale)
    void goto(href, { noScroll: true })
  }
</script>

<label class="switch">
  <span class="sr">{copy.switchEntry}</span>
  <select onchange={onChange} value={current.slug}>
    <option value="">{copy.playgroundHome}</option>
    {#each groups as group}
      <optgroup label={localizedGroup(group, locale)}>
        {#each shippingEntriesInGroup(group) as entry}
          <option value={entry.slug}>{localizedName(entry, locale)}</option>
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
