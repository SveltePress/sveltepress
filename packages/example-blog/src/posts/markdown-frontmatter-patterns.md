---
title: Markdown Frontmatter Patterns
date: 2026-03-08
tags: [markdown, content, tooling]
category: Tutorials
author: Demo Author
---

# Markdown Frontmatter Patterns

Frontmatter is the YAML block at the top of a markdown file. It's where you encode everything the renderer needs to know that isn't prose.

## The Baseline

```yaml
---
title: My Post Title
date: 2026-03-08
tags: [foo, bar]
---
```

Almost every static site generator recognizes this shape.

## Typed Frontmatter

Define a schema and validate on build:

```ts
import { z } from 'zod'

const PostSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
})
```

Fail the build on invalid frontmatter — catching a typo at build time beats a broken page in prod.

## Computed Fields

Some fields shouldn't live in frontmatter because they're derivable: `readingTime`, `excerpt`, `wordCount`. Compute these from the body during the build pipeline.

## Dates Are Strings

Always store dates as ISO strings, never native `Date` objects. YAML date parsing varies across toolchains, and strings serialize predictably to JSON.
