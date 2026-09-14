<script lang="ts">
  import type { VariantProps } from './_prototype'
  import { page } from '$app/state'
  import { entriesInGroup, GROUPS, OPEN_IN_STACKBLITZ_HREF } from './_catalog'
  import { playgroundHref } from './_prototype'
  import HostedEditorStub from './HostedEditorStub.svelte'
  import KitchenSinkCta from './KitchenSinkCta.svelte'
  import PersistCaveat from './PersistCaveat.svelte'
  import SuccessBar from './SuccessBar.svelte'
  import SwitchEntry from './SwitchEntry.svelte'

  let { entry, boot }: VariantProps = $props()
</script>

<div class="shell">
  {#if !entry}
    <div class="home" data-pagefind-body>
      <KitchenSinkCta tone="banner" />
      <header class="home-head">
        <p class="kicker">Feature directory</p>
        <h1>Playground</h1>
        <p class="lede">
          Catalog of every SveltePress capability. Pick an Entry to auto-boot
          its Starter in the Hosted editor. This page never boots.
        </p>
      </header>
      {#each GROUPS as group}
        {@const rows = entriesInGroup(group)}
        <section class="group">
          <h2>{group}</h2>
          <ul>
            {#each rows as row}
              <li>
                <a href={playgroundHref(row.slug, page.url)}>
                  <span class="name">{row.name}</span>
                  <SuccessBar kinds={row.success} note={row.barNote} />
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
          <p class="group-name">{entry.group}</p>
          <h1>{entry.name}</h1>
          <SuccessBar kinds={entry.success} note={entry.barNote} />
        </div>
        <div class="strip-actions">
          {#if entry.guideHref}
            <a class="text-link" href={entry.guideHref}>Guide</a>
          {/if}
          <a class="text-link" href={playgroundHref('kitchen-sink', page.url)}
            >Kitchen sink</a
          >
          <a
            class="text-link"
            href={OPEN_IN_STACKBLITZ_HREF}
            target="_blank"
            rel="noreferrer"
          >
            Open in StackBlitz
          </a>
          <SwitchEntry current={entry} />
        </div>
        <PersistCaveat compact />
      </div>
      <HostedEditorStub {entry} {boot} />
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
  .lede {
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
</style>
