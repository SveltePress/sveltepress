---
'@sveltepress/create': patch
---

Scaffolded projects now start with a `.gitignore`. The templates carried a file named `.gitignore`, which npm leaves out of every published package, so `npm create @sveltepress` produced projects without one. The templates also no longer pin `packageManager` to pnpm, which made Corepack refuse to run Yarn in a new project, and they declare the Node.js version SvelteKit 3 needs (`>=22.17`) in `engines`.
