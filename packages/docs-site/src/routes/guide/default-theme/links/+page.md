---
title: Default theme links
---

## Markdown format links

Links starts with `http(s)` is recognized as external links  
It would rendered a external icon to its right

**Input**

```md
[External Link](https://link.address)
[Internal Link](/foo/bar)
```

**Output**

[External Link](https://link.address)  
[Internal Link](/foo/bar)

## Directly use Link component

You can directly use Link component in md pages which is auto imported

**Input**

```md
* <Link to="https://github.com/" label="Github" />  
* <Link to="/" label="Home page" />
```

**Output**

* <Link to="https://github.com/" label="Github" />  
* <Link to="/" label="Home page" />
