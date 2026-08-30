---
title: হাতেখড়ি
---

## হেডিং

```md live no-ast
# হেডিং লেভেল ১
## হেডিং লেভেল ২
### হেডিং লেভেল ৩
#### হেডিং লেভেল ৪
##### হেডিং লেভেল ৫
###### হেডিং লেভেল ৬
```

## প্যারাগ্রাফ

```md live no-ast
এটি একটি প্যারাগ্রাফ

এটি আরেকটি প্যারাগ্রাফ

যেসব লাইনের শেষে একটির বেশি স্পেস আছে সেগুলো
soft wrap হবে।
```

## বোল্ড

```md live no-ast
**বোল্ড লেখা**
```

## স্ট্রাইক থ্রু

```md live no-ast
~এক~ অথবা ~~দুই~~ tildes `~`
```

## ইনলাইন কোড

```md live no-ast
`const foo = 'bar'`
```

## লিংক

```md live no-ast
সাধারণ লিংক
[হোম পেজ](/)
[গুগল](https://google.com/)

অটো লিংক
www.example.com
https://example.com
contact@example.com
```

## লিস্ট

```md live no-ast
- আইটেম১
- আইটেম২
- আইটেম৩

* আইটেম১
* আইটেম২
* আইটেম৩
```

## টেবিল

```md live no-ast
| নাম | রঙ | সংখ্যা |
| --- | --- | --- |
| আপেল | লাল | ১ |
| আঙ্গুর | বেগুনি | ২০ |
| কলা | হলুদ | ৩ |
```

## ফুটনোট

````md live no-ast
কিছু লেখা[^1]

বড় ফুটনোট[^bigfootnote]

[^1]: Footnote item

[^bigfootnote]: bigfootnote

    Indent paragraphs

    ```js
    const foo = 'bar'
    ```
````

:::info[লেবেল ইচ্ছামত পরিবর্তন]
আপনি আপনার কাস্টম অটো জেনারেটেড ফুটনোট টাইটেল দেখাতে [`theme.footnoteLabel`](/reference/vite-plugin/#footnoteLabel) ব্যবহার করতে পারেন
:::

## টাস্ক লিস্ট

```md live no-ast
* [ ] করতে হবে
* [x] করা হয়েছে
```

## ইমোজি

```md live no-ast
আমি :pizza: :heart:

এই লেখার মধ্যে থাকা ইমোজির শব্দগুলো পরিবর্তন হয়ে যাবে: :dog: :+1:
```
