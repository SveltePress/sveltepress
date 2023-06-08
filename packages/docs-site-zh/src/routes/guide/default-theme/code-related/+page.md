---
title: 代码相关
---

:::tip[提示]{icon=mdi:theme-light-dark}
所有的代码特性都完全与暗黑模式兼容，您可以切换来查看效果
:::

## 代码块高亮

这个特性集成了 [Shiki](https://github.com/shikijs/shiki)

````md live
```svelte
<script>
  const msg = 'world!'
</script>
  
<h1>
  Hello, {msg}
</h1>
```
````

:::tip[自定义高亮]
您可以配置自定义支持的语言列表以及不同的高亮主题，阅读 [默认主题参考 - highlight 选项](/reference/default-theme/#highlight) 来获得更多信息
:::

## 代码块标题

````md live
```svelte title="HelloWorld.svelte"
<script>
  const msg = 'world!'
</script>
  
<h1>
  Hello, {msg}
</h1>
```
````

## 显示行号

在代码块上添加 `ln` 属性即可在渲染结果中展示行号

````md live
```svelte ln
<script>
  const msg = 'world!'
</script>
  
<h1>
  Hello, {msg}
</h1>
```
````

## 行高亮

使用 `// [svp! hl]` `// [svp! ~~]` 注释指令来高亮某个行  
使用 `// [svp! hl:num]` or `// [svp! ~~:num]` 注释指令来高亮从当前行开始的总共 num 行

````md live
```svelte
<script>
  const msg = 'world!' // [svp! hl]

  function hello() {
    const foo = 'bar' // [svp! hl:2]
    const bar = foo

    return foo
  }
</script>
  
<h1>
  Hello, {msg}  // [svp! ~~]
</h1>
```
````

## 代码对比

使用 `// [svp! df:+]` or `// [svp! ++]` 来标记行对比减  
使用 `// [svp! df:-]` or `// [svp! --]` 来标记行对比加

````md live
```js
const msg = 'world!' // [svp! df:-]
const newMsg = 'new world!' // [svp! df:+]

function hello() {
  console.log('Hello', msg) // [svp! --]
  console.log('Hello', newMsg) // [svp! ++]
}
```
````

## 聚焦

使用 `// [svp! fc]` or `// [svp! !!]` 来聚焦当前行  
使用 `// [svp! fc:num]` or `// [svp! !!:num]` 来聚焦从当前行开始的总共 num 行

:::warning[Not Supported]
Multi `// [svp! fc]` in one single code block is not supported
:::

````md live
```html
<div>
  this would be blur
</div>
<div>
  this would be blur
</div>
<h1> // [svp! !!:3]
  this would be focus
</h1>
<div>
  this would be blur
</div>
<div>
  this would be blur
</div>
```
````

## Markdown 可折叠代码块

使用了 `live` 属性的 md 代码块将会渲染结果以及可折叠的源代码

**输入**

`````md
````md live
### 标题
* item1
* item2
```js
const foo = 'bar'
```
````
`````
**输出**

````md live
### 标题
* item1
* item2
```js
const foo = 'bar'
```
````

## Svelte 可折叠代码块

使用了 `live` 属性的 svelte 代码块将会渲染结果以及可折叠的源代码

**输入**

````md
```svelte live ln title=Counter.svelte
<script>
  let count = 0

  const handleClick = () => {
    count++
  }
</script>
<button on:click={handleClick}>
  您点击了 {count} 次
</button>
<style>
  button {
    background-color: purple;
    color: white;
    outline: 0;
    border: 0;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
```
````

**Output**

```svelte live ln title=Counter.svelte
<script>
  let count = 0

  const handleClick = () => {
    count++
  }
</script>
<button on:click={handleClick}>
  您点击了 {count} 次
</button>
<style>
  button {
    background-color: purple;
    color: white;
    outline: 0;
    border: 0;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
```

## 异步的 Svelte 可折叠代码块

这种类型的代码块对应的打包后的 JS 文件将会在页面中懒加载，减少页面初始加载的 JS 文件大小，减轻页面初始加载压力

**输入**

````md
```svelte live async
<h1 class="text-rose">这是一个异步的 Svelte 可折叠代码块</h1>
```
````

**输出**

```svelte live async
<h1 class="text-rose">这是一个异步的 Svelte 可折叠代码块</h1>
```


:::warning[不支持嵌套]
可折叠代码块中的可折叠代码块不予支持，将会作为普通的代码块渲染
`````md live
````md
```md live
### Title
```
````
`````
:::

## 特性组合

您可以组合上方提到的所有特性，这是一个复杂的示例：

````md live
```js ln title="complex-example.js"
function hello() {
  const oldMsg = 'Some msg with focus, diff --' // [svp! --] // [svp! !!:3]
  const newMsg1 = 'Some msg with both focus, diff ++, highlight line' // [svp! ++] // [svp! ~~]
  const newMsg2 = 'Some msg with both focus, diff ++' // [svp! ++]
}
```
````

## 导入代码

这个特性可以帮助你直接从某个文件中导入某段代码，并须髯文件后缀名作为对应的高亮语言代码块，语法如下：
```md
@code(/path/to/file[,startLine[,endLine]])
```
文件路径可以以 `.` 或 `/` 开头：
* `.` 是相对于当前 md 文件的位置
* `/` 是项目根目录，即你启动 `vite dev` 命令的目录

假设你具有如下的文件树：

```txt
├─ src
│  ├─ routes
│  │  ├─ foo
│  │  │  ├─ +page.md
│  │  │  ├─ Foo.svelte
```

* `@code(./Foo.svelte)` - 导入 Foo.svelte 的所有代码
* `@code(/src/routes/foo/Foo.svelte)` - 导入 Foo.svelte 的所有代码
* `@code(./Foo.svelte,5,10)` - 导入 Foo.svelte 的第 5 至 第 10 行代码 
* `@code(/src/routes/foo/Foo.svelte,10,20)` - 导入 Foo.svelte 的第 10 至 第 20 行代码 

:::tip[提示]{icon=solar:chat-square-code-outline}
开始与结束行都会被包含在结果中
:::

## 速查表

| 注释指令 | 相当于   | 功能介绍                      |
| -------- | -------- | ----------------------------- |
| `~~`     | `hl`     | 高亮某行                      |
| `~~:num` | `hl:num` | 高亮从当前行开始的总共 num 行 |
| `++`     | `df:+`   | 标记当前行为对比加            |
| `--`     | `df:-`   | 标记当前行为对比减            |
| `!!`     | `fc`     | 聚焦当前行                    |
| `!!:num` | `fc:num` | 聚焦从当前行开始的总共 num 行 |