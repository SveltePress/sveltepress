---
title: 导航栏
---

## 介绍

传递 `navbar` 选项给默认主题来配置导航栏

每一项可以包含如下几个属性:

* `title` - 链接文字
* `to` - 链接地址
* `icon`
  一个 HTML 字符串，将会覆盖 `title`，比如您想展示一个自定义的 Twitter 图标时可以这样做：
  ```js
  const twitterNavItem = {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23Z"/>
    </svg>`,
    to: 'https://twitter.com/'
  }
  ```
* `external` - 是否展示外部链接的图标
* `items` - 子链接

:::note[仅一层链接]{icon=carbon:tree-view-alt}
对于现在的 Sveltepress 来说，一个导航栏只能拥有一级子导航  
:::

## 配置示例

```ts title="vite.config.(js|ts)"
import { defineConfig } from 'vite'
import { sveltepress } from '@sveltepress/vite'
import { defaultTheme } from '@sveltepress/theme-default'

export default defineConfig({
  plugins: [
    sveltepress({
      theme: defaultTheme({
        navbar: [
          {
            title: 'Foo page',
            to: '/foo/'
          },
          {
            title: '具有下拉',
            items: [
              {
                title: 'Bar page',
                to: '/bar/'
              },
              {
                title: 'Github 外部链接',
                to: 'https://github.com/',
                external: true
              }
            ]
          }
        ]
      })
    })
  ]
})
```
