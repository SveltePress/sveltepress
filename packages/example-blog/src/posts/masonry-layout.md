---
title: CSS Masonry Layout Without JavaScript
date: 2026-01-30
tags: [css, web, design]
category: Web Design
author: Demo Author
---

# CSS Masonry Layout Without JavaScript

The Sveltepress Blog Theme uses CSS `columns` to achieve a masonry-style grid without any JavaScript.

## The Technique

```css
.masonry {
  columns: 1;
  column-gap: 1rem;
}

@media (min-width: 640px) {
  .masonry { columns: 2; }
}

@media (min-width: 1024px) {
  .masonry { columns: 3; }
}

.card {
  break-inside: avoid;
  margin-bottom: 1rem;
}
```

## Pros

- No JavaScript required
- Works with dynamic content
- Responsive with media queries
- Excellent browser support

## Cons

- Items flow top-to-bottom, not left-to-right
- Can't control exact item placement

## When to Use

Use CSS columns masonry for content like blog cards, image galleries, and quote lists where reading order doesn't matter.
