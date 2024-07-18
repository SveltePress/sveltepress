---
title: Basic writing
---

## Heading

```md live
# Heading level1
## Heading level2
### Heading level3
#### Heading level4
##### Heading level5
###### Heading level6
```

## Paragraph

```md live
This is paragraph

This is another paragraph  

Lines end with more than one space would be  
soft wrap
```

## Bold

```md live
**Bold text**
```

## Strike through

```md live
~one~ or ~~two~~ tildes.
```

## Inline code

```md live
`const foo = 'bar'`
```

## Links

```md live
Normal links  
[Home page](/)  
[Google](https://google.com/)

Auto links  
www.example.com  
https://example.com  
contact@example.com
```

## List

```md live

- item1
- item2
- item3

* item1
* item2
* item3
```

## Table

```md live
| Name | Color | Count |
| --- | --- | --- |
| Apple | Red | 1 |
| Grapes | Purple | 20 |
| Banana | Yellow | 3 |
```

## Footnote

````md live
Something[^1]

Big footnote[^bigfootnote]

[^1]: Footnote item

[^bigfootnote]: bigfootnote  
  
    Indent paragraphs
    
    ```js
    const foo = 'bar'
    ```
````

:::info[Label customization]
You can use [`theme.footnoteLabel`](/reference/vite-plugin/#footnoteLabel) to display your custom auto generated footnotes title
:::

## Task list

```md live
* [ ] to do
* [x] done
```

## Emojis

```md live
I :heart: :pizza:

Emojis in this text will be replaced: :dog: :+1:
```