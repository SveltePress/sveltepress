<script lang="ts">
  import type { VariantProps } from './_prototype'
  import { page } from '$app/state'
  import {
    ENTRIES,
    entriesInGroup,
    GROUPS,
    OPEN_IN_STACKBLITZ_HREF,
  } from './_catalog'
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
      <aside class="rail" aria-label="Feature directory">
        <p class="rail-title">Playground</p>
        <KitchenSinkCta tone="row" />
        <nav>
          {#each GROUPS as group}
            <a
              class="rail-group"
              href="#{group.replace(/\s+/g, '-').toLowerCase()}">{group}</a
            >
          {/each}
        </nav>
      </aside>
      <div class="listing">
        <header class="listing-head">
          <h1>Feature directory</h1>
          <p>Grouped catalog. No Hosted editor on this URL.</p>
        </header>
        {#each GROUPS as group}
          {@const rows = entriesInGroup(group)}
          <section id={group.replace(/\s+/g, '-').toLowerCase()}>
            <h2>{group}</h2>
            <table>
              <thead>
                <tr>
                  <th>Entry</th>
                  <th>Success bar</th>
                  <th>Starter</th>
                </tr>
              </thead>
              <tbody>
                {#each rows as row}
                  <tr>
                    <td
                      ><a href={playgroundHref(row.slug, page.url)}
                        >{row.name}</a
                      ></td
                    >
                    <td><SuccessBar kinds={row.success} compact /></td>
                    <td class="mono">{row.starter}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </section>
        {/each}
      </div>
    </div>
  {:else}
    <div class="entry">
      <aside class="rail entry-rail" aria-label="Switch Entry">
        <a class="home-link" href={playgroundHref(null, page.url)}
          >Playground home</a
        >
        <KitchenSinkCta tone="row" />
        {#each GROUPS as group}
          <p class="rail-group-label">{group}</p>
          {#each ENTRIES.filter(item => item.group === group) as row}
            <a
              class="rail-entry"
              class:active={row.slug === entry.slug}
              href={playgroundHref(row.slug, page.url)}>{row.name}</a
            >
          {/each}
        {/each}
      </aside>
      <div class="workspace">
        <div class="strip" data-pagefind-body>
          <div class="strip-row">
            <div>
              <p class="group-name">{entry.group}</p>
              <h1>{entry.name}</h1>
            </div>
            <SuccessBar kinds={entry.success} note={entry.barNote} />
          </div>
          <div class="strip-actions">
            {#if entry.guideHref}
              <a class="text-link" href={entry.guideHref}>Guide</a>
            {/if}
            <a
              class="text-link"
              href={OPEN_IN_STACKBLITZ_HREF}
              target="_blank"
              rel="noreferrer"
            >
              Open in StackBlitz
            </a>
            <span class="mobile-switch">
              <SwitchEntry current={entry} />
            </span>
          </div>
          <PersistCaveat compact />
        </div>
        <HostedEditorStub {entry} {boot} />
      </div>
    </div>
  {/if}
</div>

<style>
  .shell {
    --at-apply: 'min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-73px)]';
  }
  .home,
  .entry {
    --at-apply: 'min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-73px)]';
  }
  .home {
    --at-apply: 'sm:grid pb-24 sm:pb-0';
    grid-template-columns: 15rem minmax(0, 1fr);
  }
  .entry {
    --at-apply: 'sm:grid';
    grid-template-columns: 15rem minmax(0, 1fr);
  }
  .rail {
    --at-apply: 'hidden sm:flex flex-col gap-2 px-3 py-4 b-r-1 b-r-solid b-r-black/8 dark:b-r-white/8 bg-[#f0f0f2] dark:bg-[#141417] overflow-auto';
  }
  .rail-title,
  .rail-group-label {
    --at-apply: 'm-0 px-1 text-[11px] font-700 text-zinc-5';
  }
  .rail-group,
  .rail-entry,
  .home-link {
    --at-apply: 'block px-2 py-1 rounded text-[13px] no-underline text-inherit';
  }
  .rail-entry.active {
    --at-apply: 'bg-white dark:bg-[#202023] font-700 text-svp-primary-deep dark:text-svp-primary';
  }
  .listing {
    --at-apply: 'px-4 sm:px-8 py-6 overflow-auto';
  }
  .listing-head h1 {
    --at-apply: 'm-0 text-[28px] font-700 tracking-[-0.03em]';
  }
  .listing-head p {
    --at-apply: 'm-0 mt-2 text-[14px] text-zinc-5';
  }
  h2 {
    --at-apply: 'm-0 mt-8 mb-2 text-[13px] font-700';
  }
  table {
    --at-apply: 'w-full text-[13px] border-collapse';
  }
  th {
    --at-apply: 'text-left font-600 text-zinc-5 py-2 b-b-1 b-b-solid b-b-black/10 dark:b-b-white/10';
  }
  td {
    --at-apply: 'py-2 b-b-1 b-b-solid b-b-black/6 dark:b-b-white/6 align-middle';
  }
  td a {
    --at-apply: 'font-600 text-inherit no-underline';
  }
  .mono {
    --at-apply: 'font-mono text-[12px] text-zinc-5';
  }
  .workspace {
    --at-apply: 'flex flex-col min-h-0 min-w-0';
  }
  .strip {
    --at-apply: 'flex-none flex flex-col gap-2 px-4 py-3 b-b-1 b-b-solid b-b-black/8 dark:b-b-white/8';
  }
  .strip-row {
    --at-apply: 'flex flex-wrap items-start justify-between gap-3';
  }
  .group-name {
    --at-apply: 'm-0 text-[12px] text-zinc-5';
  }
  .strip h1 {
    --at-apply: 'm-0 text-[20px] font-700';
  }
  .strip-actions {
    --at-apply: 'flex flex-wrap items-center gap-3';
  }
  .text-link {
    --at-apply: 'text-[13px] font-600 text-svp-primary-deep dark:text-svp-primary no-underline';
  }
  .mobile-switch {
    --at-apply: 'sm:hidden';
  }
  @media (max-width: 949px) {
    .entry-rail {
      display: none;
    }
  }
</style>
