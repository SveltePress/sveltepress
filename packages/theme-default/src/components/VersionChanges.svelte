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
    <label for="version-changes-selector">{selectorLabel}</label>
    <select
      id="version-changes-selector"
      value={selectedVersionId}
      onchange={selectVersion}
    >
      {#each versions as version (version.id)}
        <option value={version.id}>{version.label}</option>
      {/each}
    </select>

    {#if !changes}
      <p class="change-status" role="status">{empty}</p>
    {:else if changes.baselineVersionId === null}
      <p class="change-status" role="status">{noBaseline}</p>
    {:else if changes && changes.newPages.length === 0 && changes.updatedPages.length === 0}
      <p class="change-status" role="status">{empty}</p>
    {:else if changes}
      <section aria-labelledby="version-new-pages">
        <h2 id="version-new-pages">{newPagesLabel}</h2>
        {#if changes.newPages.length}
          <ul>
            {#each changes.newPages as changedPage (changedPage.route)}
              <li>
                <a href={versionHref(changedPage.route, changes.versionId)}
                  >{changedPage.title}</a
                >
                {#if changedPage.summary}<p>{changedPage.summary}</p>{/if}
              </li>
            {/each}
          </ul>
        {:else}
          <p class="change-status" role="status">{empty}</p>
        {/if}
      </section>

      <section aria-labelledby="version-updated-pages">
        <h2 id="version-updated-pages">{updatedPagesLabel}</h2>
        {#if changes.updatedPages.length}
          <ul>
            {#each changes.updatedPages as changedPage (changedPage.route)}
              <li>
                <a href={versionHref(changedPage.route, changes.versionId)}
                  >{changedPage.title}</a
                >
                {#if changedPage.summary}<p>{changedPage.summary}</p>{/if}
                {#if changedPage.sections.length}
                  <ul class="changed-sections">
                    {#each changedPage.sections as changedSection (changedSection.id)}
                      <li>
                        <a
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
          <p class="change-status" role="status">{empty}</p>
        {/if}
      </section>
    {/if}
  </div>
{/if}

<style>
  .version-changes {
    --at-apply: 'grid gap-6';
  }
  label {
    --at-apply: 'font-600';
  }
  select {
    --at-apply: 'mt--4 w-full sm:w-auto rounded-md b-1 b-solid b-black/15 dark:b-white/15 bg-white dark:bg-zinc-9 px-3 py-2 text-base';
  }
  section {
    --at-apply: 'rounded-xl b-1 b-solid b-black/8 dark:b-white/10 p-5';
  }
  section h2 {
    --at-apply: 'mt-0 pt-0 border-t-0';
  }
  ul {
    --at-apply: 'pl-5 grid gap-4';
  }
  li > a {
    --at-apply: 'font-650';
  }
  li p {
    --at-apply: 'my-1 text-sm text-zinc-600 dark:text-zinc-300';
  }
  .changed-sections {
    --at-apply: 'mt-3 gap-2';
  }
  .changed-sections small {
    --at-apply: 'ml-2 text-xs text-zinc-500 dark:text-zinc-400';
  }
  .change-status {
    --at-apply: 'rounded-md bg-zinc-100 dark:bg-zinc-800 px-4 py-3 text-zinc-600 dark:text-zinc-300';
  }
</style>
