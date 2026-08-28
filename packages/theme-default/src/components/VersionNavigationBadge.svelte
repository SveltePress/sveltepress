<script>
  /** @type {{ label: string }} */
  const { label } = $props()
</script>

<span class="version-navigation-new-badge">{label}</span>

<style>
  .version-navigation-new-badge {
    --at-apply: 'ml-2 inline-flex flex-none items-center rounded-full bg-rose-50 dark:bg-rose-950/45 px-1.5 py-0.5 text-[9px] leading-none font-700 uppercase tracking-[0.08em] text-svp-primary-deep dark:text-svp-primary';
  }
</style>
