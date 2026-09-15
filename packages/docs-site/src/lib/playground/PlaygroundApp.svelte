<script lang="ts">
  import type { CatalogLocale, Entry } from './catalog.ts'
  import type { HostedEditorEmbed, HostedEditorTheme } from './hosted-editor.ts'
  import {
    entryBySlug,
    entryUrl,
    focusedFileForLocale,
    KITCHEN_SINK_SLUG,
    kitchenSinkCtaHref,
    localePath,
    localizedName,
    openInStackBlitzUrl,
    playgroundHomeUrl,
  } from './catalog.ts'
  import { localizedGroup, playgroundCopy } from './copy.ts'
  import HostedEditor from './HostedEditor.svelte'
  import KitchenSinkCta from './KitchenSinkCta.svelte'
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
  const entryFile = $derived(entry ? focusedFileForLocale(entry, locale) : '')

  let searchQuery = $state('')
  let activeCategory = $state<string | null>(null)
  let isSidebarOpen = $state(true)
  let showCaveatDetails = $state(false)

  function rowHref(row: Entry) {
    return entryUrl(row.slug, locale)
  }

  function filterEntries(rows: Entry[]) {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r => {
      const name = localizedName(r, locale).toLowerCase()
      const slug = r.slug.toLowerCase()
      const file = focusedFileForLocale(r, locale).toLowerCase()
      const note = (r.barNote || '').toLowerCase()
      return (
        name.includes(q) ||
        slug.includes(q) ||
        file.includes(q) ||
        note.includes(q)
      )
    })
  }
</script>

<div class="shell" class:is-entry={!!entry}>
  <KitchenSinkCta {locale} />

  {#if !entry}
    <div class="home" data-pagefind-body>
      <!-- Hero Section -->
      <header class="home-head">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          <span class="kicker">{copy.featureDirectory}</span>
        </div>
        <h1 class="hero-title">{copy.playground}</h1>
        <p class="lede">{copy.lede}</p>
        <p class="slice">{copy.sliceSentence}</p>

        <!-- Controls: Search & Category Filter -->
        <div class="filter-bar">
          <div class="search-box">
            <svg
              class="search-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clip-rule="evenodd"
              />
            </svg>
            <input
              type="search"
              bind:value={searchQuery}
              placeholder={copy.searchPlaceholder}
              class="search-input"
              aria-label={copy.searchPlaceholder}
            />
            {#if searchQuery}
              <button
                class="clear-btn"
                onclick={() => (searchQuery = '')}
                aria-label="Clear search"
              >
                &times;
              </button>
            {/if}
          </div>

          <div
            class="category-tabs"
            role="tablist"
            aria-label={copy.allCategories}
          >
            <button
              class="cat-tab"
              class:active={activeCategory === null}
              onclick={() => (activeCategory = null)}
            >
              {copy.allCategories}
            </button>
            {#each groups as group}
              <button
                class="cat-tab"
                class:active={activeCategory === group}
                onclick={() => (activeCategory = group)}
              >
                {localizedGroup(group, locale)}
              </button>
            {/each}
          </div>
        </div>
      </header>

      <!-- Catalog Sections Grid -->
      <div class="catalog-content">
        {#each groups as group}
          {@const allRows = shippingEntriesInGroup(group)}
          {@const filteredRows = filterEntries(allRows)}
          {#if (activeCategory === null || activeCategory === group) && filteredRows.length > 0}
            <section class="group-section">
              <div class="group-header">
                <h2>{localizedGroup(group, locale)}</h2>
                <span class="group-count"
                  >{filteredRows.length} {copy.starters}</span
                >
              </div>
              <ul class="cards-grid">
                {#each filteredRows as row}
                  <li class="card-item">
                    <a href={rowHref(row)} class="entry-card group">
                      <div class="card-top">
                        <span class="card-group"
                          >{localizedGroup(row.group, locale)}</span
                        >
                        <span
                          class="card-file"
                          title={focusedFileForLocale(row, locale)}
                        >
                          <code>{focusedFileForLocale(row, locale)}</code>
                        </span>
                      </div>
                      <div class="card-body">
                        <span class="name">{localizedName(row, locale)}</span>
                      </div>
                      <div class="card-footer">
                        <SuccessBar
                          kinds={row.success}
                          note={row.barNote}
                          {locale}
                        />
                        <span class="card-arrow" aria-hidden="true">&rarr;</span
                        >
                      </div>
                    </a>
                  </li>
                {/each}
              </ul>
            </section>
          {/if}
        {/each}
      </div>
    </div>
  {:else}
    <div class="entry">
      <!-- Top Strip / Control Bar -->
      <div class="strip" data-pagefind-body>
        <div class="strip-left">
          <!-- Sidebar Toggle -->
          <button
            type="button"
            class="sidebar-toggle-btn"
            class:active={isSidebarOpen}
            onclick={() => (isSidebarOpen = !isSidebarOpen)}
            aria-label={copy.browseStarters}
            title={copy.browseStarters}
          >
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="hidden sm:inline text-[12px] font-medium"
              >{copy.browseStarters}</span
            >
          </button>

          <!-- Back to Playground Home -->
          <a
            href={playgroundHomeUrl(locale)}
            class="back-btn"
            title={copy.playgroundHome}
            aria-label={copy.playgroundHome}
          >
            <span aria-hidden="true">&larr;</span>
          </a>

          <!-- Title & Breadcrumbs -->
          <div class="strip-main">
            <span class="group-name">{localizedGroup(entry.group, locale)}</span
            >
            <span class="crumb-sep" aria-hidden="true">/</span>
            <h1>{localizedName(entry, locale)}</h1>
            <span class="entry-file" title={entryFile}>
              <code>{entryFile}</code>
            </span>
            <SuccessBar kinds={entry.success} note={entry.barNote} {locale} />
          </div>
        </div>

        <div class="strip-right">
          <div class="strip-actions">
            {#if entry.guideHref}
              <a
                class="action-btn text-link"
                href={localePath(entry.guideHref, locale)}
              >
                <svg
                  class="w-3.5 h-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z"
                  />
                </svg>
                {entry.guideHref.startsWith('/reference/')
                  ? copy.reference
                  : copy.guide}
              </a>
            {/if}

            {#if entry.slug !== KITCHEN_SINK_SLUG}
              <a
                class="action-btn text-link highlight"
                href={kitchenSinkCtaHref(locale)}
              >
                {copy.kitchenSinkCta.title}
              </a>
            {/if}

            <a
              class="action-btn text-link primary"
              href={openInStackBlitzUrl(entry)}
              target="_blank"
              rel="noreferrer"
            >
              <span>{copy.openInStackBlitz}</span>
              <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h4a.75.75 0 010 1.5h-4z"
                  clip-rule="evenodd"
                />
                <path
                  fill-rule="evenodd"
                  d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                  clip-rule="evenodd"
                />
              </svg>
            </a>

            <SwitchEntry current={entry} {locale} />

            <button
              type="button"
              class="info-toggle-btn"
              class:active={showCaveatDetails}
              onclick={() => (showCaveatDetails = !showCaveatDetails)}
              title={copy.caveatTitle}
              aria-label={copy.caveatTitle}
            >
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {#if showCaveatDetails}
          <div class="caveat-popover" role="tooltip">
            <span class="caveat-icon" aria-hidden="true">&bull;</span>
            <p class="caveat">{copy.persistCaveat}</p>
          </div>
        {:else}
          <p class="caveat sr">{copy.persistCaveat}</p>
        {/if}
      </div>

      <!-- Workspace Area with Collapsible Starters Sidebar and Editor -->
      <div class="workspace">
        {#if isSidebarOpen}
          <div
            class="sidebar-backdrop sm:hidden"
            onclick={() => (isSidebarOpen = false)}
            aria-hidden="true"
          ></div>
          <aside
            class="starters-sidebar"
            data-pagefind-ignore="all"
            aria-label={copy.browseStarters}
          >
            <div class="sidebar-header">
              <span class="sidebar-title">{copy.browseStarters}</span>
              <button
                type="button"
                class="sidebar-close"
                onclick={() => (isSidebarOpen = false)}
                aria-label="Close sidebar"
              >
                &times;
              </button>
            </div>
            <div class="sidebar-scroll">
              {#each groups as group}
                {@const rows = shippingEntriesInGroup(group)}
                <div class="sidebar-group">
                  <span class="sidebar-group-title"
                    >{localizedGroup(group, locale)}</span
                  >
                  <ul class="sidebar-list">
                    {#each rows as item}
                      {@const isActive = item.slug === entry.slug}
                      <li>
                        <a
                          href={rowHref(item)}
                          class="sidebar-item"
                          class:active={isActive}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <span class="sidebar-item-name"
                            >{localizedName(item, locale)}</span
                          >
                          {#if isActive}
                            <span class="active-dot" aria-hidden="true"></span>
                          {/if}
                        </a>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/each}
            </div>
          </aside>
        {/if}

        <div class="editor-pane">
          <HostedEditor {entry} {locale} {theme} {embed} />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(html:has(.shell.is-entry)),
  :global(body:has(.shell.is-entry)) {
    overflow: hidden !important;
    height: 100% !important;
    max-height: 100% !important;
  }

  .shell {
    --at-apply: 'min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-74px)] flex flex-col bg-zinc-50/50 dark:bg-[#121215] text-zinc-900 dark:text-zinc-100';
  }

  .shell.is-entry {
    height: calc(100dvh - 3.5rem) !important;
    max-height: calc(100dvh - 3.5rem) !important;
    overflow: hidden !important;
  }
  @media (min-width: 950px) {
    .shell.is-entry {
      height: calc(100dvh - 74px) !important;
      max-height: calc(100dvh - 74px) !important;
    }
  }

  /* --- HOME PAGE STYLING --- */
  .home {
    --at-apply: 'flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-8 py-8 pb-24 flex flex-col gap-8';
  }

  .home-head {
    --at-apply: 'flex flex-col gap-3 max-w-[54rem]';
  }

  .hero-badge {
    --at-apply: 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-600 bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300 w-fit b-1 b-solid b-orange-500/20';
  }

  .badge-dot {
    --at-apply: 'w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400 animate-pulse';
  }

  .kicker {
    --at-apply: 'm-0 tracking-wide uppercase text-[11px] font-700';
  }

  .hero-title {
    --at-apply: 'm-0 text-[32px] sm:text-[44px] font-800 tracking-[-0.03em] leading-tight text-zinc-900 dark:text-white';
  }

  .lede {
    --at-apply: 'm-0 text-[16px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-normal';
  }

  .slice {
    --at-apply: 'm-0 text-[13px] leading-normal text-zinc-500 dark:text-zinc-400';
  }

  .filter-bar {
    --at-apply: 'mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 b-t-1 b-t-solid b-t-black/8 dark:b-t-white/8';
  }

  .search-box {
    --at-apply: 'relative flex items-center min-w-[240px] sm:max-w-[320px]';
  }

  .search-icon {
    --at-apply: 'absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none';
  }

  .search-input {
    --at-apply: 'w-full h-9 pl-9 pr-8 rounded-lg text-[13px] bg-white dark:bg-[#1c1c20] b-1 b-solid b-black/12 dark:b-white/12 text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-400 focus:b-svp-primary focus:ring-1 focus:ring-svp-primary';
  }

  .clear-btn {
    --at-apply: 'absolute right-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-[16px] leading-none cursor-pointer bg-transparent border-none p-0';
  }

  .category-tabs {
    --at-apply: 'flex flex-wrap items-center gap-1.5 overflow-x-auto py-1 scrollbar-none';
  }

  .cat-tab {
    --at-apply: 'px-3 py-1 rounded-md text-[12px] font-medium transition-all bg-white dark:bg-[#1c1c20] text-zinc-600 dark:text-zinc-400 b-1 b-solid b-black/8 dark:b-white/8 cursor-pointer hover:b-black/20 dark:hover:b-white/20 whitespace-nowrap';
  }

  .cat-tab.active {
    --at-apply: 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 b-transparent font-600 shadow-sm';
  }

  .catalog-content {
    --at-apply: 'flex flex-col gap-10';
  }

  .group-section {
    --at-apply: 'flex flex-col gap-3.5';
  }

  .group-header {
    --at-apply: 'flex items-baseline gap-2.5 pb-2 b-b-1 b-b-solid b-b-black/8 dark:b-b-white/8';
  }

  .group-header h2 {
    --at-apply: 'm-0 text-[15px] sm:text-[16px] font-700 tracking-tight text-zinc-800 dark:text-zinc-200';
  }

  .group-count {
    --at-apply: 'text-[11px] font-600 text-zinc-400 dark:text-zinc-500 uppercase tracking-wide';
  }

  .cards-grid {
    --at-apply: 'list-none m-0 p-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5';
  }

  .card-item {
    --at-apply: 'm-0 p-0 flex';
  }

  .card-item + .card-item {
    margin-top: 0 !important;
  }

  .entry-card {
    --at-apply: 'flex-1 flex flex-col justify-between p-4 rounded-xl bg-white dark:bg-[#18181c] b-1 b-solid b-black/8 dark:b-white/8 no-underline text-inherit transition-all duration-200 hover:shadow-md hover:b-orange-500/40 dark:hover:b-orange-500/50 hover:-translate-y-0.5';
  }

  .card-top {
    --at-apply: 'flex items-center justify-between gap-2 text-[11px] min-w-0';
  }

  .card-group {
    --at-apply: 'font-600 text-orange-600 dark:text-orange-400 truncate uppercase text-[10px] tracking-wider';
  }

  .card-file {
    --at-apply: 'truncate text-zinc-400 dark:text-zinc-500 font-mono text-[10.5px] bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded';
  }

  .card-body {
    --at-apply: 'my-2.5';
  }

  .card-body .name {
    --at-apply: 'text-[15px] font-700 tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400';
  }

  .card-footer {
    --at-apply: 'flex items-center justify-between gap-2 pt-2.5 b-t-1 b-t-solid b-t-black/6 dark:b-t-white/6 min-w-0';
  }

  .card-arrow {
    --at-apply: 'text-[14px] font-bold text-zinc-300 dark:text-zinc-600 transition-all group-hover:text-orange-500 group-hover:translate-x-1 shrink-0';
  }

  /* --- ENTRY PAGE / WORKSPACE STYLING --- */
  .entry {
    --at-apply: 'flex-1 flex flex-col min-h-0 h-full overflow-hidden';
  }

  .strip {
    --at-apply: 'flex-none flex flex-nowrap items-center justify-between gap-2 px-3 sm:px-4 py-1.5 bg-white dark:bg-[#161619] b-b-1 b-b-solid b-b-black/8 dark:b-b-white/8 shadow-sm relative z-10 min-h-[40px] max-h-[44px] overflow-visible';
  }

  .strip-left {
    --at-apply: 'flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden';
  }

  .sidebar-toggle-btn {
    --at-apply: 'inline-flex items-center gap-1.5 h-7.5 px-2 rounded-md text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 b-1 b-solid b-black/8 dark:b-white/8 cursor-pointer transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700 shrink-0';
  }

  .sidebar-toggle-btn.active {
    --at-apply: 'bg-orange-500/15 text-orange-600 dark:bg-orange-500/25 dark:text-orange-300 b-orange-500/30';
  }

  .back-btn {
    --at-apply: 'inline-flex items-center justify-center w-7.5 h-7.5 rounded-md text-[13px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 b-1 b-solid b-black/8 dark:b-white/8 no-underline hover:text-zinc-900 dark:hover:text-white shrink-0';
  }

  .strip-main {
    --at-apply: 'flex items-center gap-2 min-w-0 overflow-hidden';
  }

  .group-name {
    --at-apply: 'm-0 text-[10.5px] font-700 uppercase tracking-wide text-orange-600 dark:text-orange-400 shrink-0';
  }

  .crumb-sep {
    --at-apply: 'text-zinc-300 dark:text-zinc-600 text-[11px] shrink-0';
  }

  .strip h1 {
    --at-apply: 'm-0 text-[13.5px] sm:text-[14.5px] font-700 tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap truncate shrink-0';
  }

  .entry-file {
    --at-apply: 'hidden lg:inline font-mono text-[10.5px] text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded truncate shrink-0';
  }

  .strip-right {
    --at-apply: 'flex items-center gap-2 shrink-0';
  }

  .strip-actions {
    --at-apply: 'flex items-center gap-1.5 sm:gap-2';
  }

  .action-btn {
    --at-apply: 'inline-flex items-center gap-1 h-7.5 px-2 sm:px-2.5 rounded-md text-[11.5px] font-600 no-underline transition-all bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 b-1 b-solid b-black/8 dark:b-white/8 hover:bg-zinc-200 dark:hover:bg-zinc-700 shrink-0';
  }

  .action-btn.primary {
    --at-apply: 'bg-orange-500 text-white dark:bg-orange-500 dark:text-white b-transparent hover:bg-orange-600 dark:hover:bg-orange-600 shadow-sm';
  }

  .action-btn.highlight {
    --at-apply: 'bg-orange-500/10 text-orange-700 dark:bg-orange-400/20 dark:text-orange-300 b-orange-500/20';
  }

  .info-toggle-btn {
    --at-apply: 'inline-flex items-center justify-center w-7.5 h-7.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 b-1 b-solid b-black/8 dark:b-white/8 cursor-pointer transition-colors shrink-0';
  }

  .info-toggle-btn.active {
    --at-apply: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white';
  }

  .caveat-popover {
    --at-apply: 'absolute top-full right-3 mt-1.5 max-w-[24rem] p-3 rounded-lg bg-white dark:bg-[#1c1c20] b-1 b-solid b-black/12 dark:b-white/12 shadow-xl z-30 flex items-start gap-2 text-left';
  }

  .caveat-popover .caveat {
    --at-apply: 'm-0 text-[11.5px] leading-relaxed text-zinc-600 dark:text-zinc-300';
  }

  .caveat-icon {
    --at-apply: 'text-orange-500 text-[14px] leading-none shrink-0 mt-0.5';
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  /* --- WORKSPACE: SIDEBAR & EDITOR PANE --- */
  .workspace {
    --at-apply: 'flex-1 flex min-h-0 h-full relative overflow-hidden';
  }

  .sidebar-backdrop {
    --at-apply: 'fixed inset-0 bg-black/40 z-30 sm:hidden';
  }

  .starters-sidebar {
    --at-apply: 'w-56 sm:w-60 shrink-0 bg-white dark:bg-[#141417] b-r-1 b-r-solid b-r-black/8 dark:b-r-white/8 flex flex-col z-20 h-full min-h-0 overflow-hidden shadow-md sm:shadow-none max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:z-40 max-sm:w-64';
  }

  .sidebar-header {
    --at-apply: 'flex items-center justify-between px-3 py-1.5 b-b-1 b-b-solid b-b-black/8 dark:b-b-white/8 bg-zinc-50/70 dark:bg-[#18181c] shrink-0';
  }

  .sidebar-title {
    --at-apply: 'text-[11px] font-700 uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
  }

  .sidebar-close {
    --at-apply: 'text-[16px] leading-none text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent border-none cursor-pointer p-0 sm:hidden';
  }

  .sidebar-scroll {
    --at-apply: 'flex-1 overflow-y-auto px-1.5 py-1.5 flex flex-col gap-1.5 min-h-0';
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(150, 150, 150, 0.3) transparent;
  }

  .sidebar-group {
    --at-apply: 'flex flex-col gap-0';
  }

  .sidebar-group-title {
    --at-apply: 'text-[9.5px] font-700 uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 py-0.5 mt-0.5 select-none';
  }

  .sidebar-list {
    margin: 0 !important;
    padding: 0 !important;
    list-style: none !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 1px !important;
  }

  .sidebar-list li,
  .sidebar-list li + li {
    margin: 0 !important;
    padding: 0 !important;
    margin-top: 0 !important;
  }

  .sidebar-item {
    --at-apply: 'flex items-center justify-between px-2 py-1 rounded text-[11.5px] leading-snug text-zinc-700 dark:text-zinc-300 no-underline transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80';
  }

  .sidebar-item.active {
    --at-apply: 'bg-orange-500/10 dark:bg-orange-400/15 text-orange-600 dark:text-orange-400 font-semibold';
  }

  .sidebar-item-name {
    --at-apply: 'truncate';
  }

  .active-dot {
    --at-apply: 'w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400 shrink-0 ml-1';
  }

  .editor-pane {
    --at-apply: 'flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden';
  }
</style>
