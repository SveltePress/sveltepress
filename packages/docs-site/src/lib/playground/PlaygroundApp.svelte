<script lang="ts">
  import type { CatalogLocale, Entry } from './catalog.ts'
  import type { HostedEditorEmbed, HostedEditorTheme } from './hosted-editor.ts'
  import {
    entryBySlug,
    entryUrl,
    localePath,
    localizedName,
    openInStackBlitzUrl,
  } from './catalog.ts'
  import { localizedGroup, playgroundCopy } from './copy.ts'
  import HostedEditor from './HostedEditor.svelte'
  import { shippingEntriesInGroup, shippingGroups } from './shipping.ts'
  import SuccessBar from './SuccessBar.svelte'
  import SwitchEntry from './SwitchEntry.svelte'

  let {
    locale,
    slug,
    theme,
    embed,
  }: {
    locale: CatalogLocale
    slug?: string
    theme?: HostedEditorTheme
    embed?: HostedEditorEmbed
  } = $props()

  const copy = $derived(playgroundCopy(locale))
  const entry = $derived(slug ? entryBySlug(slug) : undefined)
  const groups = $derived(shippingGroups())

  function rowHref(row: Entry) {
    return entryUrl(row.slug, locale)
  }
</script>

<div class="shell">
  {#if !entry}
    <div class="home" data-pagefind-body>
      <header class="home-head">
        <p class="kicker">{copy.featureDirectory}</p>
        <h1>{copy.playground}</h1>
        <p class="lede">{copy.lede}</p>
        <p class="slice">{copy.sliceSentence}</p>
      </header>
      {#each groups as group}
        {@const rows = shippingEntriesInGroup(group)}
        <section class="group">
          <h2>{localizedGroup(group, locale)}</h2>
          <ul>
            {#each rows as row}
              <li>
                <a href={rowHref(row)}>
                  <span class="name">{localizedName(row, locale)}</span>
                  <SuccessBar kinds={row.success} note={row.barNote} {locale} />
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  {:else}
    <div class="entry">
      <div class="strip" data-pagefind-body>
        <div class="strip-main">
          <p class="group-name">{localizedGroup(entry.group, locale)}</p>
          <h1>{localizedName(entry, locale)}</h1>
          <SuccessBar kinds={entry.success} note={entry.barNote} {locale} />
        </div>
        <div class="strip-actions">
          {#if entry.guideHref}
            <a class="text-link" href={localePath(entry.guideHref, locale)}
              >{copy.guide}</a
            >
          {/if}
          <a
            class="text-link"
            href={openInStackBlitzUrl(entry)}
            target="_blank"
            rel="noreferrer"
          >
            {copy.openInStackBlitz}
          </a>
          <SwitchEntry current={entry} {locale} />
        </div>
        <p class="caveat">{copy.persistCaveat}</p>
      </div>
      <HostedEditor {entry} {locale} {theme} {embed} />
    </div>
  {/if}
</div>

<style>
  .shell {
    --at-apply: 'min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-73px)] flex flex-col';
  }
  .home {
    --at-apply: 'flex-1 pb-24';
  }
  .home-head {
    --at-apply: 'px-4 sm:px-8 pt-8 pb-6 max-w-[52rem]';
  }
  .kicker,
  .group-name {
    --at-apply: 'm-0 text-[12px] font-600 text-zinc-5 dark:text-zinc-4';
  }
  h1 {
    --at-apply: 'm-0 mt-1 text-[28px] sm:text-[36px] font-700 tracking-[-0.03em] leading-none';
  }
  .lede,
  .slice {
    --at-apply: 'm-0 mt-3 text-[15px] leading-6 text-zinc-6 dark:text-zinc-4 max-w-[40rem]';
  }
  .group {
    --at-apply: 'px-4 sm:px-8 py-4';
  }
  h2 {
    --at-apply: 'm-0 mb-2 text-[13px] font-700 text-zinc-5 dark:text-zinc-4';
  }
  ul {
    --at-apply: 'list-none m-0 p-0';
  }
  li + li {
    --at-apply: 'mt-0';
  }
  li a {
    --at-apply: 'flex flex-wrap items-center justify-between gap-2 py-2.5 b-b-1 b-b-solid b-b-black/8 dark:b-b-white/8 no-underline text-inherit';
  }
  .name {
    --at-apply: 'font-600';
  }
  .entry {
    --at-apply: 'flex-1 flex flex-col min-h-0';
  }
  .strip {
    --at-apply: 'flex-none flex flex-col gap-2 px-4 py-3 bg-[#f6f6f6] dark:bg-[#18181b] b-b-1 b-b-solid b-b-black/8 dark:b-b-white/8';
  }
  .strip-main {
    --at-apply: 'flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0';
  }
  .strip h1 {
    --at-apply: 'text-[18px] sm:text-[20px]';
  }
  .strip-actions {
    --at-apply: 'flex flex-wrap items-center gap-3';
  }
  .text-link {
    --at-apply: 'text-[13px] font-600 text-svp-primary-deep dark:text-svp-primary no-underline';
  }
  .caveat {
    --at-apply: 'm-0 text-[12px] leading-5 text-zinc-5 dark:text-zinc-4';
  }
</style>
