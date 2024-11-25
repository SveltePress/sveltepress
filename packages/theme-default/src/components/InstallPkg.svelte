<script>
  import Npm from './icons/logos/Npm.svelte'
  import NpmWithColor from './icons/logos/NpmWithColor.svelte'
  import Pnpm from './icons/logos/Pnpm.svelte'
  import PnpmWithColor from './icons/logos/PnpmWithColor.svelte'
  import Yarn from './icons/logos/Yarn.svelte'
  import YarnWithColor from './icons/logos/YarnWithColor.svelte'
  import TabPanel from './TabPanel.svelte'
  import Tabs from './Tabs.svelte'
  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [npm] - NPM snippet
   * @property {import('svelte').Snippet} [yarn] - Yarn snippet
   * @property {import('svelte').Snippet} [pnpm] - PNPM snippet
   */

  /** @type {Props} */
  const { npm, yarn, pnpm } = $props()
</script>

<Tabs activeName="NPM" bodyPadding={false}>
  <TabPanel name="NPM" activeIcon={NpmWithColor} inactiveIcon={Npm}>
    {@render npm?.()}
  </TabPanel>
  <TabPanel name="YARN" activeIcon={YarnWithColor} inactiveIcon={Yarn}>
    {@render yarn?.()}
  </TabPanel>
  <TabPanel name="PNPM" activeIcon={PnpmWithColor} inactiveIcon={Pnpm}>
    {@render pnpm?.()}
  </TabPanel>
</Tabs>
