---
title: 高亮块
---

## 语法

:::important[图标需要预构建]{icon=tabler:icons}
用到的图标需要加入 [iconify 预构建配置](/reference/default-theme/#preBuildIconifyIcons) 中
:::

这个特性集成了 [remark-directive](https://github.com/remarkjs/remark-directive)

```md
:::tip|info|note|warning|important|caution|danger[标题]
一些高亮内容
:::
```

## 提示

```md live no-ast
:::tip[提示标题]
一些提示内容
:::

:::tip[自定义图标的提示标题]{icon=openmoji:red-apple}
一些提示内容
:::
```

## 信息

```md live no-ast
:::info[信息标题]
一些信息内容
:::

:::info[自定义图标的信息标题]{icon=openmoji:red-apple}
一些信息内容
:::
```

## 注意

```md live no-ast
:::note[注意标题]
一些注意内容
:::

:::note[自定义图标的注意标题]{icon=openmoji:red-apple}
一些注意内容
:::
```

## 警告

```md live no-ast
:::warning[警告标题]
一些警告内容
:::

:::warning[自定义图标的警告标题]{icon=openmoji:red-apple}
一些警告内容
:::
```
## 重要

```md live no-ast
:::important[重要标题]
一些重要的内容
:::

:::important[自定义图标的重要标题]{icon=openmoji:red-apple}
一些重要的内容
:::
```

## 当心
```md live no-ast
:::caution[当心标题]
一些当心内容
:::

:::caution[自定义图标的当心标题]{icon=openmoji:red-apple}
一些当心内容
:::
```

## 危险
```md live no-ast
:::danger[危险标题]
一些危险内容
:::

:::danger[自定义图标的危险标题]{icon=openmoji:red-apple}
一些危险内容
:::
```

## 链接与行内代码

高亮块内的链接和行内代码会继承高亮块的主题色与背景色：

```md live no-ast
:::tip[提示标题]
[提示链接](/guide/introduction/) 与 `tip` 都匹配提示的主题色
:::

:::info[信息标题]
[信息链接](/guide/introduction/) 与 `info` 都匹配信息的主题色
:::

:::note[注意标题]
[注意链接](/guide/introduction/) 与 `note` 都匹配注意的主题色
:::

:::warning[警告标题]
[警告链接](/guide/introduction/) 与 `warning` 都匹配警告的主题色
:::

:::important[重要标题]
[重要链接](/guide/introduction/) 与 `important` 都匹配重要的主题色
:::

:::caution[当心标题]
[当心链接](/guide/introduction/) 与 `caution` 都匹配当心的主题色
:::

:::danger[危险标题]
[危险链接](/guide/introduction/) 与 `danger` 都匹配危险的主题色
:::
```
