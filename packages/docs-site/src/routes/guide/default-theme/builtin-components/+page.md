---
title: Built-in Components
---

:::note[Manually import]{icon=carbon:import-export}
All built-in Components can directly use in markdown files.  
But should be imported manually in svelte files. 
:::

## Links

### Props

* `label` - The link label text
* `to` - The link address
* `withBase` - Determine whether to with [sveltekit config.kit.paths.base](https://kit.svelte.dev/docs/modules#$app-paths-base). Default is `true`

:::info[Auto external icon]{icon=ic:sharp-rocket-launch}
Would auto add a external icon when link address starts with http or https
:::

### In markdown

```md live
* <Link to="https://github.com/" label="Github" />  
* <Link to="/" label="Home page" />
```

### In svelte

```svelte live
<script>
  import { Link } from '@sveltepress/theme-default/components' // [svp! ~~]
</script>
<div style="line-height: 24px;">
  <Link to="/" label="Home page" /> <br />
  <Link to="https://github.com/" label="Github" />
</div>
```

## Tabs & TabPanel

### Tab Props

* `activeName` - The default active panel name.
* `bodyPadding` - Determine whether the panel body has a padding or not. Default is `true`

### TabPanel Props

* `name` - The panel name.
* `activeIcon` - The icon component used when tab is active
* `inactiveIcon` - The icon component used when tab is inactive


### In Markdown

````md live
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

### In svelte

```svelte live
<script>
  import { TabPanel, Tabs } from '@sveltepress/theme-default/components' // [svp! ~~]
</script>
<Tabs activeName="Tab2">
  <TabPanel name="Tab1">
    <div>Tab1 content</div>
  </TabPanel>
  <TabPanel name="Tab2">
    <div>Tab2 content</div>
  </TabPanel>
</Tabs>
```

## Expansion

### Props

* `title` - The expansion title
* `showIcon` - Determine whether to the icon or not. Default is `true`
* `headerStyle` - Customize the header inline style
* `bind:expanded` - Determine the expanded status. Default is `false`

### Slots

* `default` - The expansion content
* `icon-fold` - The icon used for folded
* `icon-expanded` - The icon used for expanded
* `arrow` - Customize the expansion arrow indicator

### In markdown

```md live
<Expansion title="Click to expand/fold panel">
  <div class="text-[24px]">Some content</div>
</Expansion>
```
### In svelte

```svelte live
<script>
  import { Expansion } from '@sveltepress/theme-default/components'
</script>
<Expansion title="A expansion without custom icon and arrow">
  <div class="p-4 text-[24px]">
    Look at the icon left. It gets colored when expanded!
  </div>
  <div slot="icon-fold" class="i-bxs-wink-smile"></div>
  <div slot="icon-expanded" class="i-fxemoji-smiletongue"></div>
  <div slot="arrow" class="i-material-symbols-thumbs-up-down"></div>
</Expansion>
```

## Icons (Pre-build iconify icons)

:::important[Icon pre-build required]{icon=tabler:icons}
The iconify icons should be in the [Pre-build iconify icons config](/reference/default-theme/#preBuildIconifyIcons)
:::

### In markdown

```md live
<div style="font-size: 28px;">
  <IconifyIcon collection="vscode-icons" name="file-type-svelte" />
</div>
```

### In svelte

```svelte live
<script>
  import { IconifyIcon } from '@sveltepress/theme-default/components'
</script>
<div style="font-size: 28px;">
  <IconifyIcon collection="vscode-icons" name="file-type-svelte" />
</div>
```

## Floating

### In markdown

```md live
<Floating placement="top">
  <div class="text-xl b-1 b-solid b-blue rounded py-10 px-4">
    Trigger
  </div>

  <div class="bg-white dark:bg-dark b-1 b-solid b-blue rounded p-4" slot="floating-content">
    Floating content
  </div>
</Floating>
```

### In svelte


```svelte live
<script>
  import Floating from '@sveltepress/twoslash/FloatingWrapper.svelte'
</script>
<Floating placement="right">
  <div class="text-xl b-1 b-solid b-blue rounded py-10 px-4">
    Trigger
  </div>

  <div class="bg-white dark:bg-dark b-solid b-1 b-red rounded p-4" slot="floating-content">
    Floating content
  </div>
</Floating>
```

### Props

* `alwaysShow` - Determine whether to always show the floating content. Default is `false`
* `placement` - Determine the floating content position. See [placement - floating-ui](https://floating-ui.com/docs/computePosition#placement). Default is `bottom`.
* `floatingClass` - The addition classes that will be added to the floating content container.