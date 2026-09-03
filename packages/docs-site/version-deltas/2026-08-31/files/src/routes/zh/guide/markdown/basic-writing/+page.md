---
title: 写作基础
---

## 标题

```md live no-ast
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

## 段落

```md live no-ast
这是一个段落

这是另一个段落

以两个及以上空格结尾的行将会
自动换行
```

## 粗体

```md live no-ast
**这是一些加粗文字**
```

## 删除线

```md live no-ast
~一个~ 或者 ~~两个~~ 波浪号
```

## 行内代码

```md live no-ast
`const foo = 'bar'`
```

## 链接

```md live no-ast
普通链接
[Home page](/)
[Google](https://google.com/)

自动识别文字链接
www.example.com
https://example.com
contact@example.com
```

## 列表

```md live no-ast
- 列表项1
- 列表项2
- 列表项3

* 列表项1
* 列表项2
* 列表项3
```

## 表格

```md live no-ast
| 名称 | 颜色 | 数量 |
| --- | --- | --- |
| 苹果 | 红色 | 1 |
| 葡萄 | 紫色 | 20 |
| 香蕉 | 黄色 | 3 |
```

## 脚注

````md live no-ast
脚注1[^1]

复杂的脚注[^bigfootnote]

[^1]: 普通的脚注

[^bigfootnote]: 复杂的脚注

    可以包括段落，以及下方的代码块

    ```js
    const foo = 'bar'
    ```
````

:::info[标题自定义]
你可以使用 [`theme.footnoteLabel`](/reference/vite-plugin/#footnoteLabel) 来自定义脚注标题
:::

## 任务列表

```md live no-ast
* [ ] 未完成任务
* [x] 已完成任务
```

## Emojis

```md live no-ast
我 :heart: :pizza:

这是一只狗头 :dog:

这是一个 +1 :+1:
```
