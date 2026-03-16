---
'@sveltepress/theme-default': minor
---

feat: auto-generated sidebar from routes directory

Added support for automatically generating sidebar configuration by scanning the `src/routes/` directory. This eliminates the need for manual sidebar configuration in large documentation projects.

Usage:
```js
sidebar: { enabled: true }
```

Supports frontmatter fields for fine-grained control:
- `title` / `sidebarTitle` — display title
- `order` — numeric sort order
- `sidebar: false` — exclude from sidebar
- `collapsible` — collapsible group

Fully backward compatible with existing manual sidebar configuration.
