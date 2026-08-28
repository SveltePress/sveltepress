<script lang="ts">
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import themeOptions from 'virtual:sveltepress/theme-default'
  import { manifest, resolveVersionChanges } from 'virtual:sveltepress/versions'
  import { getPathFromBase } from './utils'

  const defaultNoBaseline =
    'This is the first version, so there is no earlier baseline to compare.'
  const defaultEmpty = 'No changes were recorded for this version.'
  const versions = $derived(
    manifest ? [manifest.current, ...manifest.versions] : [],
  )
  const selectedVersionId = $derived.by(() => {
    const requested = browser ? page.url.searchParams.get('version') : null
    return versions.some(version => version.id === requested)
      ? requested!
      : (manifest?.current.id ?? '')
  })
  const changes = $derived(resolveVersionChanges(selectedVersionId))
  const selectedVersionLabel = $derived(versionLabel(selectedVersionId))
  const newPageCount = $derived(changes?.newPages.length ?? 0)
  const updatedPageCount = $derived(changes?.updatedPages.length ?? 0)
  const selectorLabel = $derived(
    themeOptions.i18n?.versionChangesSelector ?? 'View changes for version',
  )
  const newPagesLabel = $derived(
    themeOptions.i18n?.versionChangesNewPages ?? 'New pages',
  )
  const updatedPagesLabel = $derived(
    themeOptions.i18n?.versionChangesUpdatedPages ?? 'Updated pages',
  )
  const noBaseline = $derived(
    themeOptions.i18n?.versionChangesNoBaseline ?? defaultNoBaseline,
  )
  const empty = $derived(themeOptions.i18n?.versionChangesEmpty ?? defaultEmpty)

  function versionHref(route: string, versionId: string, sectionId?: string) {
    if (!manifest) return route
    const path =
      versionId === manifest.current.id
        ? route
        : `${manifest.basePath}/${versionId}${route}`
    return `${getPathFromBase(path)}${sectionId ? `#${sectionId}` : ''}`
  }

  function versionLabel(versionId: string): string {
    return (
      versions.find(version => version.id === versionId)?.label ?? versionId
    )
  }

  async function selectVersion(event: Event) {
    const versionId = (event.currentTarget as HTMLSelectElement).value
    const params = new URLSearchParams(page.url.searchParams)
    params.set('version', versionId)
    await goto(`${page.url.pathname}?${params}`)
  }
</script>

{#if manifest}
  <div class="version-changes">
    <section class="release-summary" aria-label={selectedVersionLabel}>
      <div class="release-heading">
        <span class="release-kicker">{selectorLabel}</span>
        <strong class="release-version">{selectedVersionLabel}</strong>
      </div>
      <div class="release-stats">
        <div class="release-stat release-stat--new">
          <strong>{newPageCount}</strong>
          <span>{newPagesLabel}</span>
        </div>
        <div class="release-stat release-stat--updated">
          <strong>{updatedPageCount}</strong>
          <span>{updatedPagesLabel}</span>
        </div>
      </div>
      <label class="version-picker" for="version-changes-selector">
        <span>{selectorLabel}</span>
        <select
          id="version-changes-selector"
          value={selectedVersionId}
          onchange={selectVersion}
        >
          {#each versions as version (version.id)}
            <option value={version.id}>{version.label}</option>
          {/each}
        </select>
      </label>
    </section>

    {#if !changes}
      <p class="change-status" role="status">{empty}</p>
    {:else}
      {#if changes.baselineVersionId === null}
        <p class="change-status" role="status">{noBaseline}</p>
      {:else if changes.newPages.length === 0 && changes.updatedPages.length === 0}
        <p class="change-status" role="status">{empty}</p>
      {/if}
      <div class="change-sections">
        <section
          class="change-section change-section--new"
          aria-labelledby="version-new-pages"
        >
          <header class="change-section-heading">
            <span class="section-marker" aria-hidden="true">+</span>
            <h2 id="version-new-pages">
              {newPagesLabel} <span class="section-count">{newPageCount}</span>
            </h2>
          </header>
          {#if changes.newPages.length}
            <ul class="change-grid">
              {#each changes.newPages as changedPage (changedPage.route)}
                <li class="change-card">
                  <a
                    class="change-card-link"
                    href={versionHref(changedPage.route, changes.versionId)}
                    ><span>{changedPage.title}</span><span aria-hidden="true"
                      >↗</span
                    ></a
                  >
                  {#if changedPage.summary}<p>{changedPage.summary}</p>{/if}
                </li>
              {/each}
            </ul>
          {:else}
            <p class="change-status">{empty}</p>
          {/if}
        </section>

        <section
          class="change-section change-section--updated"
          aria-labelledby="version-updated-pages"
        >
          <header class="change-section-heading">
            <span class="section-marker" aria-hidden="true">↻</span>
            <h2 id="version-updated-pages">
              {updatedPagesLabel}
              <span class="section-count">{updatedPageCount}</span>
            </h2>
          </header>
          {#if changes.updatedPages.length}
            <ul class="change-grid">
              {#each changes.updatedPages as changedPage (changedPage.route)}
                <li class="change-card">
                  <a
                    class="change-card-link"
                    href={versionHref(changedPage.route, changes.versionId)}
                    ><span>{changedPage.title}</span><span aria-hidden="true"
                      >↗</span
                    ></a
                  >
                  {#if changedPage.summary}<p>{changedPage.summary}</p>{/if}
                  {#if changedPage.sections.length}
                    <ul class="changed-sections">
                      {#each changedPage.sections as changedSection (changedSection.id)}
                        <li>
                          <a
                            class="section-link"
                            href={versionHref(
                              changedPage.route,
                              changes.versionId,
                              changedSection.id,
                            )}>{changedSection.title}</a
                          >
                          <small
                            >{versionLabel(changedSection.introducedIn)}</small
                          >
                          {#if changedSection.summary}<p>
                              {changedSection.summary}
                            </p>{/if}
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </li>
              {/each}
            </ul>
          {:else}
            <p class="change-status">{empty}</p>
          {/if}
        </section>
      </div>
    {/if}
  </div>
{/if}

<style>
  .version-changes {
    --at-apply: 'grid gap-8 sm:gap-10 relative';
  }
  .release-summary {
    --at-apply: 'relative overflow-hidden grid gap-6 rounded-3xl b-1 b-solid b-black/8 dark:b-white/10 bg-white/75 dark:bg-zinc-900/75 p-5 sm:p-7';
    box-shadow: 0 24px 70px rgb(24 24 27 / 8%);
  }
  .release-summary::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 0% 0%, rgb(244 63 94 / 14%), transparent 42%),
      radial-gradient(
        circle at 100% 100%,
        rgb(245 158 11 / 10%),
        transparent 38%
      );
    pointer-events: none;
  }
  .release-summary > * {
    --at-apply: 'relative z-1';
  }
  .release-heading {
    --at-apply: 'grid gap-1';
  }
  .release-kicker,
  .version-picker > span {
    --at-apply: 'text-xs font-700 uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400';
  }
  .release-version {
    --at-apply: 'text-7 sm:text-9 leading-tight tracking-[-0.03em] text-zinc-900 dark:text-zinc-50';
  }
  .release-stats {
    --at-apply: 'grid grid-cols-2 gap-3';
  }
  .release-stat {
    --at-apply: 'min-w-0 rounded-2xl px-4 py-3 bg-white/75 dark:bg-white/6 b-1 b-solid b-black/6 dark:b-white/8 grid gap-0.5';
  }
  .release-stat strong {
    --at-apply: 'text-6 leading-none text-zinc-900 dark:text-zinc-50';
  }
  .release-stat span {
    --at-apply: 'text-xs text-zinc-500 dark:text-zinc-400 break-words';
  }
  .release-stat--new strong {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary';
  }
  .release-stat--updated strong {
    --at-apply: 'text-amber-700 dark:text-amber-300';
  }
  .version-picker {
    --at-apply: 'grid gap-2';
  }
  select {
    --at-apply: 'w-full min-w-42 rounded-xl b-1 b-solid b-black/12 dark:b-white/12 bg-white dark:bg-zinc-900 px-4 py-2.5 text-base font-600 text-zinc-800 dark:text-zinc-100 outline-none focus-visible:ring-3 focus-visible:ring-svp-primary/25';
  }
  .change-sections {
    --at-apply: 'grid gap-6 items-start';
  }
  .change-section {
    --at-apply: 'rounded-3xl b-1 b-solid b-black/8 dark:b-white/10 bg-white/55 dark:bg-white/[0.025] p-5 sm:p-6 min-w-0';
  }
  .change-section-heading {
    --at-apply: 'flex items-center gap-3 mb-5';
  }
  .section-marker {
    --at-apply: 'w-9 h-9 rounded-xl inline-flex items-center justify-center font-800 text-lg bg-rose-100 dark:bg-rose-950/55 text-svp-primary-deep dark:text-svp-primary';
  }
  .change-section--updated .section-marker {
    --at-apply: 'bg-amber-100 dark:bg-amber-950/55 text-amber-700 dark:text-amber-300';
  }
  .change-section h2 {
    --at-apply: 'm-0 p-0 border-0 text-5 sm:text-6 leading-tight tracking-[-0.02em] flex items-center gap-2';
  }
  .section-count {
    --at-apply: 'inline-flex min-w-7 h-7 px-2 items-center justify-center rounded-full text-xs font-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300';
  }
  .change-grid {
    --at-apply: 'list-none p-0 m-0 grid gap-3';
  }
  .change-card {
    --at-apply: 'm-0 rounded-2xl bg-white dark:bg-zinc-900/90 b-1 b-solid b-black/7 dark:b-white/8 p-4 transition-transform transition-shadow duration-200';
  }
  .change-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 34px rgb(24 24 27 / 8%);
  }
  .change-card-link {
    --at-apply: 'font-700 text-base text-zinc-900 dark:text-zinc-50 flex items-center justify-between gap-3 decoration-none';
  }
  .change-card-link span:last-child {
    --at-apply: 'text-svp-primary-deep dark:text-svp-primary';
  }
  .change-card p {
    --at-apply: 'my-2 text-sm text-zinc-600 dark:text-zinc-300';
  }
  .changed-sections {
    --at-apply: 'list-none p-0 mt-4 mb-0 grid gap-2';
  }
  .changed-sections li {
    --at-apply: 'm-0 flex flex-wrap items-center gap-2';
  }
  .section-link {
    --at-apply: 'inline-flex rounded-lg bg-amber-50 dark:bg-amber-950/35 px-2.5 py-1.5 text-sm font-650 text-amber-800 dark:text-amber-200 decoration-none hover:bg-amber-100 dark:hover:bg-amber-950/55';
  }
  .changed-sections small {
    --at-apply: 'text-xs text-zinc-500 dark:text-zinc-400';
  }
  .change-status {
    --at-apply: 'm-0 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300';
  }

  @media (min-width: 950px) {
    .release-summary {
      grid-template-columns: minmax(220px, 1fr) minmax(180px, 220px);
      align-items: center;
    }
    .release-stats {
      grid-column: 1 / -1;
      grid-row: 2;
    }
    .version-picker {
      grid-column: 2;
      grid-row: 1;
    }
    .change-sections {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1200px) {
    .release-summary {
      grid-template-columns: minmax(220px, 1fr) auto minmax(180px, 220px);
    }
    .release-stats,
    .version-picker {
      grid-column: auto;
      grid-row: auto;
    }
  }
</style>
