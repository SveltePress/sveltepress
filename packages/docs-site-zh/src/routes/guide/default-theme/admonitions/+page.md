---
title: 高亮块
---

## 语法

:::important[图标需要预构建]{icon=tabler:icons}
用到的图标需要加入 [iconify 预构建配置](/reference/default-theme/#preBuildIconifyIcons) 中
:::

这个特性集成了 [remark-directive](https://github.com/remarkjs/remark-directive) 

```md
:::tip|info|note|warning|important|caution[标题]
一些高亮内容
:::
```

## 提示

```md live
:::tip[提示标题]
一些提示内容
:::

:::tip[自定义图标的提示标题]{icon=openmoji:red-apple}
一些提示内容
:::
```

## 信息

```md live
:::info[信息标题]
一些信息内容
:::

:::info[自定义图标的信息标题]{icon=openmoji:red-apple}
一些信息内容
:::
```

## 注意

```md live
:::note[注意标题]
一些注意内容
:::

:::note[自定义图标的注意标题]{icon=openmoji:red-apple}
一些注意内容
:::
```

## 警告

```md live
:::warning[警告标题]
一些警告内容
:::

:::warning[自定义图标的警告标题]{icon=openmoji:red-apple}
一些警告内容
:::
```
## 重要

```md live
:::important[重要标题]
一些重要的内容
:::

:::important[自定义图标的重要标题]{icon=openmoji:red-apple}
一些重要的内容
:::
```

## 当心
```md live
:::caution[当心标题]
一些当心内容
:::

:::caution[自定义图标的当心标题]{icon=openmoji:red-apple}
一些当心内容
:::
```
