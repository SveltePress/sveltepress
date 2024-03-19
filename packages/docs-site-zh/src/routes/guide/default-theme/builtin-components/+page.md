---
title: 内置组件
---

:::note[手动与自动导入]{icon=carbon:import-export}
所有的内置组件都可以直接在 md 文件中使用，但是必须在 svelte 中手动导入
:::

## Link

### Props

* `label` - 链接文案
* `to` - 链接地址
* `withBase` - 是否用 [sveltekit config.kit.paths.base](https://kit.svelte.dev/docs/modules#$app-paths-base) 属性作为前缀，默认为 `true`

:::info[自动外部化图标]{icon=ic:sharp-rocket-launch}
以 `http(s)` 开头的链接将会被自动识别为外部链接，会展示外部链接的图标
:::

### Markdown 中使用

```md live
* <Link to="https://github.com/" label="Github" />  
* <Link to="/" label="首页" />
```

### Svelte 中使用

```svelte live
<script>
  import { Link } from '@sveltepress/theme-default/components' // [svp! ~~]
</script>
<div style="line-height: 24px;">
  <Link to="/" label="首页" /> <br />
  <Link to="https://github.com/" label="Github" />
</div>
```

## Tabs & TabPanel

### Tab Props

* `activeName` - 默认选中的面板名
* `bodyPadding` - 面板内容是否具有一个默认的 `padding` 值，默认为：`true`

### TabPanel Props

* `name` - 面板名
* `activeIcon` - 选中时展示的图标内容，是一个 svelte 组件
* `inactiveIcon` - 未选中时展示的图标内容，是一个 svelte 组件


### Markdown 中使用

````md live
<Tabs activeName="Svelte">
  <TabPanel name="Svelte">

```svelte title="Counter.svelte"
<script>
  let count = 0
</script>
<button on:click={() => count++}>
  你点击了 {count} 次
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
  你点击了 {{ count }} 次
</button>
```

  </TabPanel>
</Tabs>
````

### Svelte 中使用

```svelte live
<script>
  import { TabPanel, Tabs } from '@sveltepress/theme-default/components' // [svp! ~~]
</script>
<Tabs activeName="Tab2">
  <TabPanel name="Tab1">
    <div>面板一内容</div>
  </TabPanel>
  <TabPanel name="Tab2">
    <div>面板二内容</div>
  </TabPanel>
</Tabs>
```

## Expansion

### Props

* `title` - 标题
* `showIcon` - 是否展示图标，默认为：`true`
* `headerStyle` - 自定义头部行内样式
* `bind:expanded` - 是否处于展开状态，默认为：`false`

### Slots

* `default` - 需要折叠/展开的内容
* `icon-fold` - 折叠状态下展示的图标
* `icon-expanded` - 展开状态下展示的图标
* `arrow` - 自定义箭头部分的内容

### Markdown 中使用

```md live
<Expansion title="点击展开/折叠面板">
  <div class="text-[24px]">一些可折叠的内容</div>
</Expansion>
```
### Svelte 中使用

```svelte live
<script>
  import { Expansion } from '@sveltepress/theme-default/components'
</script>
<Expansion title="一个拥有自定义内容的折叠面板">
  <div class="p-4 text-[24px]">
    看看左边，展开时会变色哦！
  </div>
  <div slot="icon-fold" class="i-bxs-wink-smile"></div>
  <div slot="icon-expanded" class="i-fxemoji-smiletongue"></div>
  <div slot="arrow" class="i-material-symbols-thumbs-up-down"></div>
</Expansion>
```

## Icons (Iconify 图标预构建)

:::important[图标需要预构建]{icon=tabler:icons}
用到的图标需要加入 [iconify 预构建配置](/reference/default-theme/#preBuildIconifyIcons) 中
:::

### Markdown 中使用

```md live
<div style="font-size: 28px;">
  <IconifyIcon collection="vscode-icons" name="file-type-svelte" />
</div>
```

### Svelte 中使用

```svelte live
<script>
  import { IconifyIcon } from '@sveltepress/theme-default/components'
</script>
<div style="font-size: 28px;">
  <IconifyIcon collection="vscode-icons" name="file-type-svelte" />
</div>
```

## Floating

### Markdown 中使用

```md live
<Floating placement="top">
  <div class="text-xl b-1 b-solid b-blue rounded py-10 px-4">
    将鼠标放置在这里
  </div>

  <div class="bg-white dark:bg-dark b-1 b-solid b-blue rounded p-4" slot="floating-content">
    漂浮内容
  </div>
</Floating>
```

### Svelte 中使用

```svelte live
<script>
  import { Floating } from '@sveltepress/theme-default/components'
</script>
<Floating placement="right">
  <div class="text-xl b-1 b-solid b-blue rounded py-10 px-4">
    将鼠标放置在这里
  </div>

  <div class="bg-white dark:bg-dark b-solid b-1 b-red rounded p-4" slot="floating-content">
    漂浮内容
  </div>
</Floating>
```

### Props

* `alwaysShow` - 是否始终展示浮动内容，默认为 `false`
* `placement` - 指定浮动弹出层相对于触发内容的位置，完整取值参考：[placement - floating-ui](https://floating-ui.com/docs/computePosition#placement)，默认为：`bottom`.
* `floatingClass` - 加到弹出层容器上的额外自定义样式类名