---
title: Tabs
---

## Use in Markdown

**Input**

````md
<Tabs activeName="Svelte">

  <TabPanel name="Svelte">

```svelte title="Counter.svelte"
<script>
  let count = 0
</script>
<button on:click={() => count++}>
  You've clicked {count} times
</button>
```

  </TabPanel>

  <TabPanel name="Vue">

```html  title="Counter.vue"
<script setup>
  import { ref } from 'vue'

  const count = ref(0)
</script>
<button @click="count++">
  You've clicked {count} times
</button>
```

  </TabPanel>

</Tabs>
````

**Output**

<Tabs activeName="Svelte">

  <TabPanel name="Svelte">

```svelte title="Counter.svelte"
<script>
  let count = 0
</script>
<button on:click={() => count++}>
  You've clicked {count} times
</button>
```

  </TabPanel>

  <TabPanel name="Vue">

```html  title="Counter.vue"
<script setup>
  import { ref } from 'vue'

  const count = ref(0)
</script>
<button @click="count++">
  You've clicked {count} times
</button>
```

  </TabPanel>

</Tabs>

## Use in Svelte

```svelte live
<script>
  import Tabs from '@sveltepress/theme-default/Tabs.svelte' // [svp! ~~:2]
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

:::info[Auto import in markdown]
Notice that you won't need to import `Tabs` and `TabPanel` manually in markdown.  
But needed when in svelte files.
:::

## NPM/YARN/PNPM tab

### Install

**Input**

```md
@install-pkg(your-package-name)
```

**Output**

@install-pkg(your-package-name)

### Custom script

**Input**

```md
@install-pkg(your-package-name,custom-script)
```

**Output**

@install-pkg(your-package-name,custom-script)

