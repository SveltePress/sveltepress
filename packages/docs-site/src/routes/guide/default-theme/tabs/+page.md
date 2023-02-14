---
title: Tabs
---

## Use in Markdown

**Input**

```md
<Tabs activeName="TabTabTab2">
  <TabPanel name="Tab1">
    <div>Tab1 content</div>
  </TabPanel>
  <TabPanel name="TabTabTab2">
    <div>Tab2 content</div>
  </TabPanel>
</Tabs>
```

**Output**

<Tabs activeName="TabTabTab2">
  <TabPanel name="Tab1">
    <div>Tab1 content</div>
  </TabPanel>
  <TabPanel name="TabTabTab2">
    <div>Tab2 content</div>
  </TabPanel>
</Tabs>

## Use in Svelte

```svelte live
<script>
  import Tabs from '@sveltepress/theme-default/Tabs.svelte'
  import TabPanel from '@sveltepress/theme-default/TabPanel.svelte'
</script>
<Tabs activeName="TabTabTab2">
  <TabPanel name="Tab1">
    <div>Tab1 content</div>
  </TabPanel>
  <TabPanel name="TabTabTab2">
    <div>Tab2 content</div>
  </TabPanel>
</Tabs>
```

:::info Auto import in markdown
Notice that you won't need to import `Tabs` and `TabPanel` manually in markdown.  
But needed when in svelte files.
:::