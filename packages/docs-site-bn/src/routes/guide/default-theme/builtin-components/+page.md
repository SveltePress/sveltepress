---
title: বিল্ট-ইন কম্পোনেন্ট
---

:::note[ম্যানুয়ালি ইমপোর্ট]{icon=carbon:import-export}
বিল্ট-ইন কম্পোনেন্টগুলো মার্কডাউন ফাইলে সরাসরি ব্যবহার করা যাবে।
কিন্তু svelte ফাইলে ম্যানুয়ালি ইমপোর্ট করতে হবে।
:::

## Links

### Props

* `label` - লিংকের লেবেলের লেখা
* `to` - লিংকের ঠিকানা
* `withBase` - [sveltekit config.kit.paths.base](https://kit.svelte.dev/docs/modules#$app-paths-base) সঙ্গে কিনা তা নির্ধারণ করে। ডিফল্ট হচ্ছে `true`

:::info[অটো এক্সটার্নাল আইকন]{icon=ic:sharp-rocket-launch}
লিংক অ্যাড্রেস http বা https দিয়ে শুরু হলে একটি অটো এক্সটার্নাল আইকন যুক্ত করবে।
:::

### Markdown এ

```md live
* <Link to="https://github.com/" label="Github" />
* <Link to="/" label="Home page" />
```

### Svelte এ

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

* `activeName` - ডিফল্ট অ্যাক্টিভ প্যানেলের নাম
* `bodyPadding` - প্যানেল বডিতে প্যাডিং আছে কিনা তা নির্ধারণ করে, ডিফল্ট হচ্ছে `true`

### TabPanel Props

* `name` - প্যানেলের নাম।
* `activeIcon` - ট্যাব অ্যাক্টিভ থাকাকালীন যে আইকন কম্পোনেন্ট ব্যবহার হবে।
* `inactiveIcon` - ট্যাব ইন্যাক্টিভ থাকাকালীন যে আইকন কম্পোনেন্ট ব্যবহার হবে।

### Markdown এ

````md live
<Tabs activeName="Svelte">
  <TabPanel name="Svelte">

```svelte title="Counter.svelte"
<script>
  let count = $state(0)
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

### Svelte এ

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

* `title` - এক্সপ্যানসন এর টাইটেল।
* `showIcon` - আইকন দেখাবে কিনা তা নির্ধারণ করে, ডিফল্ট হচ্ছে `true`।
* `headerStyle` - হেডারের ইনলাইন স্টাইল কাস্টমাইজ করতে।
* `bind:expanded` - সম্প্রসারিত অংশের অবস্থা নির্ধারণ, ডিফল্ট হচ্ছ...`false`

### Slots

* `default` - এক্সপ্যানসন এর কন্টেন্ট
* `icon-fold` - ফোল্ড করা অবস্থার আইকন
* `icon-expanded` - এক্সপ্যান্ড করা অবস্থার আইকন
* `arrow` - এক্সপ্যানসন এর তীর নির্দেশক কাস্টমাইজ করা

### Markdown এ

```md live
<Expansion title="Click to expand/fold panel">
  <div class="text-[24px]">Some content</div>
</Expansion>
```
### Svelte এ

```svelte live
<script>
  import { Expansion } from '@sveltepress/theme-default/components'
</script>
<Expansion title="A expansion without custom icon and arrow">
  <div class="p-4 text-[24px]">
    Look at the icon left. It gets colored when expanded!
  </div>
  {#snippet iconFold()}
    <div class="i-bxs-wink-smile"></div>
  {/snippet}
  {#snippet iconExpanded()}
    <div class="i-fxemoji-smiletongue"></div>
  {/snippet}
  {#snippet arrow()}
    <div class="i-material-symbols-thumbs-up-down"></div>
  {/snippet}
</Expansion>
```

## Icons (Pre-build iconify icons)

:::important[আইকন প্রিবিল্ড আবশ্যক]{icon=tabler:icons}
Iconify আইকন  [পূর্ব প্রস্তুতকৃত Iconify আইকন কনফিগ](/reference/default-theme/#preBuildIconifyIcons) এ থাকতে হবে
:::

### Markdown এ

```md live
<div style="font-size: 28px;">
  <IconifyIcon collection="vscode-icons" name="file-type-svelte" />
</div>
```

### Svelte এ

```svelte live
<script>
  import { IconifyIcon } from '@sveltepress/theme-default/components'
</script>
<div style="font-size: 28px;">
  <IconifyIcon collection="vscode-icons" name="file-type-svelte" />
</div>
```

## Floating

### Markdown এ

```md live
<Floating placement="top">
  <div class="text-xl b-1 b-solid b-blue rounded py-10 px-4">
    এখানে-মাউস-আনুন-বা-টাচ-করুন
  </div>
  {#snippet floatingContent()}
    <div class="bg-white dark:bg-dark b-1 b-solid b-blue rounded p-4">
      হাই, নির্দেশনা অনুযায়ী কাজ করার জন্য ধন্যবাদ
    </div>
  {/snippet}
</Floating>
```

### Svelte এ

```svelte live
<script>
  import Floating from '@sveltepress/twoslash/FloatingWrapper.svelte'
</script>
<Floating placement="right">
  <div class="text-xl b-1 b-solid b-blue rounded py-10 px-4">
    এখানে-মাউস-আনুন-বা-টাচ-করুন
  </div>
  {#snippet floatingContent()}
    <div class="bg-white dark:bg-dark b-solid b-1 b-red rounded p-4">
      হাই, নির্দেশনা অনুযায়ী কাজ করার জন্য ধন্যবাদ
    </div>
  {/snippet}
</Floating>
```

### Props

* `alwaysShow` - ফ্লোটিং কন্টেন্ট সর্বদা দেখাবে কিনা- তা নির্ধারণ করে। ডিফল্ট হচ্ছে `false`
* `placement` - ফ্লোটিং কন্টেন্টের পজিশন নির্ধারণ করে। দেখুন- [placement - floating-ui](https://floating-ui.com/docs/computePosition#placement) । ডিফল্ট হচ্ছে `bottom`.
* `floatingClass` - ফ্লোটিং কন্টেন্ট কন্টেইনারে যোগ করার জন্য অতিরিক্তি ক্লাস।
