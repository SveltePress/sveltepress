---
title: 主页
---

## Frontmatter

`src/routes/+page.(md|svelte)` 文件将会被当作主页

用当前站点使用的主页配置举例：

@code(../../../+page.md)

您可以在[本站的首页](/)看到效果

### `heroImage`

首页的大 Logo 图片，推荐使用质量较高的图片

### `tagline`

在标题以及描述之下的补充文字

### `actions`

动作按钮，每个按钮包含如下几个属性：
* `label`  
  按钮里的文案
* `to`  
  按钮的链接
* `external`  
  是否展示外部链接的图标

### `features`

特性卡片

* `title`  
  标题
* `description`  
  描述
* `icon`  
自定义卡片图标
  * `type` - `'svg' 或者 'iconify'`
  * `value` - svg 的 DOM 内容
  * `collection` - Iconfiy 分类名称
  * `name` - Iconfiy 分类下的图标名称
* `link`  
  点击特性卡片跳转的链接地址   
  当提供此项时特性卡片将会具有一个可点击的交互样式  
  以 http(s) 开头的链接将会被自动识别为外部链接，将会在卡片右上角出现一个外部图标

:::important[图标需要预构建]{icon=tabler:icons}
用到的图标需要加入 [iconify 预构建配置](/reference/default-theme/#preBuildIconifyIcons) 中
:::

### `home`

设置为 `false` 可以移除所有的默认首页内容，通常用于需要自定义首页内容时

## 插槽

### `hero-image`

设置一个自定义的首页大 Logo 内容，比如： 

```html title="/src/routes/+page.(md|svelte)"
<div slot="hero-image">
Custom hero image content
</div>
```
