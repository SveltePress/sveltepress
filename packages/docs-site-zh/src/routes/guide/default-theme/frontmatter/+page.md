---
title: 默认主题中的 frontmatter
---

## 共享的 frontmatter

```ts
interface CommonFrontmatter {
  title?: string
  description?: string
  lastUpdate?: string
}
```

### `title`
最终的页面标题将会是： `page frontmatter title | siteConfig.title`  

### `description`
最终的页面描述将会是 `frontmatter.description`，如果没有配置则会使用 `siteConfig.description`
  
###  `lastUpdate` 

将会影响页面底部的 "last update at: " 内容，默认将会读取 +page.(md|svelte) 文件的最后 git 提交时间     
您可以通过该项配置来覆盖这个默认行为，展示您所需要的文案 

### `sidebar`

控制侧边导航栏的显示/隐藏，默认为 `true`，设置为 `false` 隐藏侧边导航栏

### `header`

控制顶部导航栏的显示/隐藏，默认为 `true`，设置为 `false` 隐藏顶部导航栏

## 特殊 frontmatter

* [首页 frontmatter](/guide/default-theme/home-page/#Frontmatter)