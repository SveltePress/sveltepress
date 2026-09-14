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
      <KitchenSinkCta tone="stage" />
      {#each GROUPS as group}
        {@const rows = entriesInGroup(group)}
        <section class="reel">
          <h2>{group}</h2>
          <div class="film">
            {#each rows as row}
              <a class="card" href={playgroundHref(row.slug, page.url)}>
                <span class="card-name">{row.name}</span>
                <SuccessBar kinds={row.success} compact />
                <span class="card-file">{row.focusedFile}</span>
              </a>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  {:else}
    <div class="entry">
      <div class="strip mobile-first" data-pagefind-body>
        <div class="dock-top">
          <p class="group-name">{entry.group}</p>
          <h1>{entry.name}</h1>
          <SuccessBar kinds={entry.success} note={entry.barNote} />
        </div>
        <div class="dock-actions">
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
      <div class="stage">
        <HostedEditorStub {entry} {boot} />
      </div>
      <div class="dock desktop-dock" data-pagefind-body>
        <div class="dock-copy">
          <p class="group-name">{entry.group}</p>
          <p class="dock-title">{entry.name}</p>
          <SuccessBar kinds={entry.success} compact />
        </div>
        <div class="dock-actions">
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
    </div>
  {/if}
</div>

<style>
  .shell {
    --at-apply: 'min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-73px)] flex flex-col';
  }
  .home {
    --at-apply: 'pb-24';
  }
  .reel {
    --at-apply: 'px-4 sm:px-8 py-5';
  }
  h2 {
    --at-apply: 'm-0 mb-3 text-[13px] font-700 text-zinc-5';
  }
  .film {
    --at-apply: 'flex gap-3 overflow-x-auto pb-2';
  }
  .card {
    --at-apply: 'flex flex-col gap-2 min-w-[13rem] max-w-[16rem] p-3 rounded-lg bg-white dark:bg-[#202023] b-1 b-solid b-black/8 dark:b-white/10 no-underline text-inherit';
  }
  .card-name {
    --at-apply: 'font-700 text-[15px]';
  }
  .card-file {
    --at-apply: 'text-[11px] font-mono text-zinc-5 break-all';
  }
  .entry {
    --at-apply: 'flex-1 flex flex-col min-h-0';
  }
  .stage {
    --at-apply: 'flex-1 flex min-h-0';
  }
  .strip,
  .dock {
    --at-apply: 'flex-none flex flex-col gap-2 px-4 py-3 bg-[#f6f6f6] dark:bg-[#18181b]';
  }
  .strip {
    --at-apply: 'b-b-1 b-b-solid b-b-black/8 dark:b-b-white/8';
  }
  .dock {
    --at-apply: 'b-t-1 b-t-solid b-t-black/8 dark:b-t-white/8';
  }
  .group-name {
    --at-apply: 'm-0 text-[12px] text-zinc-5';
  }
  h1,
  .dock-title {
    --at-apply: 'm-0 text-[18px] font-700';
  }
  .dock-copy {
    --at-apply: 'flex flex-wrap items-center gap-3';
  }
  .dock-actions {
    --at-apply: 'flex flex-wrap items-center gap-3';
  }
  .text-link {
    --at-apply: 'text-[13px] font-600 text-svp-primary-deep dark:text-svp-primary no-underline';
  }
  .desktop-dock {
    display: none;
  }
  @media (min-width: 950px) {
    .mobile-first {
      display: none;
    }
    .desktop-dock {
      display: flex;
    }
    .entry {
      min-height: calc(100dvh - 73px);
    }
  }
</style>
