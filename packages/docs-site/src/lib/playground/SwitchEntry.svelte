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
  <div class="select-wrap">
    <select
      onchange={onChange}
      value={current.slug}
      aria-label={copy.switchEntry}
    >
      <option value="">{copy.playgroundHome}</option>
      {#each groups as group}
        <optgroup label={localizedGroup(group, locale)}>
          {#each shippingEntriesInGroup(group) as entry}
            <option value={entry.slug}>{localizedName(entry, locale)}</option>
          {/each}
        </optgroup>
      {/each}
    </select>
    <svg
      class="chevron"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clip-rule="evenodd"
      />
    </svg>
  </div>
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
  .select-wrap {
    --at-apply: 'relative inline-flex items-center min-w-0';
  }
  select {
    --at-apply: 'appearance-none max-w-full h-8 pl-2.5 pr-7 rounded-md text-[12px] font-medium bg-white dark:bg-[#202024] b-1 b-solid b-black/12 dark:b-white/12 text-zinc-800 dark:text-zinc-200 cursor-pointer outline-none transition-colors hover:b-svp-primary focus:b-svp-primary focus:ring-1 focus:ring-svp-primary';
  }
  .chevron {
    --at-apply: 'pointer-events-none absolute right-2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500';
  }
</style>
