<script>
  import Tabs from './Tabs.svelte'
  import TabPanel from './TabPanel.svelte'
  import Npm from './icons/logos/Npm.svelte'
  import NpmWithColor from './icons/logos/NpmWithColor.svelte'
  import Pnpm from './icons/logos/Pnpm.svelte'
  import PnpmWithColor from './icons/logos/PnpmWithColor.svelte'
  import Yarn from './icons/logos/Yarn.svelte'
  import YarnWithColor from './icons/logos/YarnWithColor.svelte'
</script>

<Tabs activeName="NPM" bodyPadding={false}>
  <TabPanel name="NPM" activeIcon={NpmWithColor} inactiveIcon={Npm}>
    <slot name="npm" />
  </TabPanel>
  <TabPanel name="YARN" activeIcon={YarnWithColor} inactiveIcon={Yarn}>
    <slot name="yarn" />
  </TabPanel>
  <TabPanel name="PNPM" activeIcon={PnpmWithColor} inactiveIcon={Pnpm}>
    <slot name="pnpm" />
  </TabPanel>
</Tabs>
