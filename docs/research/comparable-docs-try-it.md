# How comparable docs sites let visitors try the product

Research for [Docs-site Playground](https://github.com/SveltePress/sveltepress/issues/448) / [#449](https://github.com/SveltePress/sveltepress/issues/449).

Question: how do the live docs of VitePress, Astro / Starlight, Vue, Svelte, and Docusaurus let a visitor try the product in the browser, and what unit do they open?

This is input to Playground information architecture, not a vote to copy anyone. Every factual claim below is from a live docs page or from the URL that page actually opens (followed redirects). Fetched 2026-09-14.

## Pattern in one paragraph

The **docs-site generators** (VitePress, Starlight, Docusaurus) do **not** embed a REPL of one Markdown file. They send the visitor **off-site** to StackBlitz and/or CodeSandbox with **one full starter project** (config + a handful of pages + package.json). Astro additionally puts a **named-template gallery** on `astro.new`. The **UI frameworks** (Vue, Svelte) do the opposite for language features: an **in-chrome, per-feature REPL** of one component (sometimes a few files), plus a separate **full-app StackBlitz** when the unit is an application framework (Vite + Vue, SvelteKit). None of the five ships a per-capability catalog of docs-site starters.

---

## VitePress

Primary pages: [homepage](https://vitepress.dev/), [Getting Started](https://vitepress.dev/guide/getting-started) ([markdown source served by the site](https://vitepress.dev/guide/getting-started.md)).

### What try-it is

A **StackBlitz button**, not a REPL, not an embed, not a feature gallery.

Getting Started opens with:

> You can try VitePress directly in your browser on [StackBlitz](https://vitepress.new).

[`https://vitepress.new`](https://vitepress.new) redirects to [`https://stackblitz.com/fork/vite-jhbvp5?file=docs%2Findex.md`](https://stackblitz.com/fork/vite-jhbvp5?file=docs%2Findex.md) (HTTP `Location` header). The homepage itself has no try-it control — only What is VitePress, Quickstart, and GitHub ([homepage](https://vitepress.dev/)).

There is no in-docs playground. [Using Vue in Markdown](https://vitepress.dev/guide/using-vue.md) shows static input/output snippets, not a live editor.

### Artifact that opens

A **full VitePress site**, not one file. The StackBlitz URL opens `docs/index.md` inside a forked project. Getting Started documents the matching scaffold ([Getting Started](https://vitepress.dev/guide/getting-started.md)):

```
.
├─ docs
│  ├─ .vitepress
│  │  └─ config.js
│  ├─ api-examples.md
│  ├─ markdown-examples.md
│  └─ index.md
└─ package.json
```

That is the `vitepress init` kitchen-sink: config plus a home page, a Markdown-examples page, and an API-examples page.

### Organization

**One kitchen-sink starter.** No per-feature directory of VitePress capabilities (i18n, search, versions, custom theme, …) to open separately.

### Chrome

**Leaves the site.** The visitor goes from `vitepress.dev` to `stackblitz.com`. The editor is StackBlitz chrome, not VitePress docs chrome.

---

## Astro / Starlight

Primary pages: [Starlight homepage](https://starlight.astro.build/), [Starlight Getting Started](https://starlight.astro.build/getting-started/), [Astro Getting started](https://docs.astro.build/en/getting-started/), [Install Astro](https://docs.astro.build/en/install-and-setup/), [astro.new](https://astro.new/), [Build a Blog Tutorial](https://docs.astro.build/en/tutorial/0-introduction/).

### What try-it is

A **StackBlitz (and CodeSandbox) button** that opens a **named template**. Not a REPL. Not an iframe embed inside the docs page.

Starlight Getting Started, under “See it in action”:

> Try Starlight in your browser: [open the template on StackBlitz](https://stackblitz.com/github/withastro/starlight/tree/main/examples/basics).

Install Astro:

> Prefer to try Astro in your browser? Visit [astro.new](https://astro.new/) to browse our starter templates and spin up a new Astro project without ever leaving your browser.

[`astro.new`](https://astro.new/) is a **template gallery**: Just the Basics, Blog, Starlight, Starlog, Portfolio, Empty Project. Each card offers Preview, Source code, Copy CLI command, **Open in StackBlitz**, and **Open in CodeSandbox**. `https://astro.new/starlight-basics?on=stackblitz` redirects to [`https://stackblitz.com/github/withastro/starlight/tree/main/examples/basics?on=stackblitz`](https://stackblitz.com/github/withastro/starlight/tree/main/examples/basics?on=stackblitz).

The Starlight homepage has Get started / View on GitHub only ([homepage](https://starlight.astro.build/)). [Themes](https://starlight.astro.build/resources/themes/) is a visual catalog of community theme *sites*, not an editor.

The blog tutorial also offers a completed project: “open a working version in an online coding environment such as [StackBlitz](https://stackblitz.com/github/withastro/blog-tutorial-demo/tree/complete?file=src%2Fpages%2Findex.astro)” ([tutorial intro](https://docs.astro.build/en/tutorial/0-introduction/)). That is a finished blog app, not the Starlight docs starter.

### Artifact that opens

A **full Astro (+ Starlight) app**. The basics example’s README calls it “Starlight Starter Kit: Basics” and lists ([example README](https://raw.githubusercontent.com/withastro/starlight/main/examples/basics/README.md); live StackBlitz title “Starlight Basics Example”):

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Content in that template is a splash `index.mdx`, `guides/example.md`, and a reference folder — a small docs site, not one Markdown file. `package.json` name is `@example/starlight-basics` ([package.json](https://raw.githubusercontent.com/withastro/starlight/main/examples/basics/package.json)).

The Starlight repo also has `examples/markdoc` and `examples/tailwind` ([examples listing](https://api.github.com/repos/withastro/starlight/contents/examples)), but Getting Started only links **basics**. `astro.new` is where multiple templates are offered as first-class choices.

### Organization

**Named templates, each a whole site.** Not a per-Starlight-feature catalog (sidebar, i18n, plugins, …). Closest analog to a “directory” is `astro.new`’s gallery of product shapes (blog, docs, portfolio, empty).

### Chrome

**Leaves the docs site.** Starlight docs → StackBlitz. Astro docs → `astro.new` (separate origin, Astro marketing chrome) → StackBlitz or CodeSandbox. Preview links on `astro.new` (`/latest/preview/…`) are read-only built sites, not editors.

---

## Vue

Primary pages: [homepage](https://vuejs.org/), [Quick Start](https://vuejs.org/guide/quick-start.md), [Tooling](https://vuejs.org/guide/scaling-up/tooling.md), [Tutorial](https://vuejs.org/tutorial/), [Examples](https://vuejs.org/examples/), [SFC Playground](https://play.vuejs.org/), [Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.md).

Vue is not a docs-site generator. It is included because the ticket asked for it, and because it is the clearest in-chrome REPL pattern.

### What try-it is

**Several surfaces**, stacked:

1. **Navbar Playground** — top-level nav item linking to `https://play.vuejs.org` (external). Visible in the live examples HTML (`target="_blank"` on Playground) and in the [docs nav config](https://raw.githubusercontent.com/vuejs/docs/main/.vitepress/config.ts).
2. **Embedded REPL on `/tutorial/` and `/examples/`** — `@vue/repl` inside the Vue docs chrome. Tutorial: “You can edit the code on the right and see the result update instantly” ([step-1 description](https://raw.githubusercontent.com/vuejs/docs/main/src/tutorial/src/step-1/description.md)). Both pages set `page: true` and mount `TutorialRepl` / `ExampleRepl` under `<ClientOnly>` ([tutorial index](https://raw.githubusercontent.com/vuejs/docs/main/src/tutorial/index.md), [examples index](https://raw.githubusercontent.com/vuejs/docs/main/src/examples/index.md)).
3. **“Try it in the Playground” links** on guide pages, which leave to `play.vuejs.org` with a hash-encoded snippet ([Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.md)).
4. **StackBlitz full-app** — Quick Start and Tooling: “try a complete build setup right within your browser on [StackBlitz](https://vite.new/vue)”. [`https://vite.new/vue`](https://vite.new/vue) redirects to [`https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-vue?file=index.html&terminal=dev`](https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-vue?file=index.html&terminal=dev). Tooling calls this “IDE-like environment running actual Vite dev server in the browser / Closest to local setup” ([Tooling](https://vuejs.org/guide/scaling-up/tooling.md)).
5. Secondary: JSFiddle, CodePen, Scrimba (Quick Start / Tooling “Other Online Playgrounds”).

`play.vuejs.org` is a standalone app titled **Vue SFC Playground** (page `<title>`).

### Artifact that opens

Depends which door:

| Door | Unit |
| --- | --- |
| SFC Playground / guide “Try it in the Playground” | Encoded **SFC(s)**, typically `App.vue`. Tooling: “Both online playgrounds mentioned above also support downloading files as a Vite project.” |
| Tutorial / Examples (SFC mode) | `store.setFiles(..., 'App.vue')` ([ExampleRepl](https://raw.githubusercontent.com/vuejs/docs/main/src/examples/ExampleRepl.vue), [TutorialRepl](https://raw.githubusercontent.com/vuejs/docs/main/src/tutorial/TutorialRepl.vue)). Hello World is one component ([hello-world](https://api.github.com/repos/vuejs/docs/contents/src/examples/src/hello-world)). Simple Component is **two files**: `App` + `TodoItem` ([simple-component](https://api.github.com/repos/vuejs/docs/contents/src/examples/src/simple-component)). |
| Tutorial / Examples (HTML mode) | `index.html` (no-build). |
| StackBlitz | **Full Vite + Vue app** (`create-vite` `template-vue`). |

### Organization

**Per-feature**, not one kitchen-sink:

- Tutorial: 15 hash-routed steps (`step-1` … `step-15`) ([tutorial src](https://api.github.com/repos/vuejs/docs/contents/src/tutorial/src)).
- Examples sidebar: Basic / Practical / 7 GUIs, each a hash on `/examples/` ([examples sidebar in config](https://raw.githubusercontent.com/vuejs/docs/main/.vitepress/config.ts)).
- Playground is freeform (plus whatever snippet a guide page packed into the URL).
- StackBlitz is the one full-app starter.

### Chrome

- Tutorial and Examples **sit in Vue docs chrome** (site header remains; tutorial uses a custom split layout with instructions + REPL).
- Playground **leaves** to `play.vuejs.org` (still Vue-branded, not the docs theme).
- StackBlitz / JSFiddle / CodePen **leave** the Vue site.

---

## Svelte

Primary pages: [docs landing](https://svelte.dev/docs), [Svelte overview](https://svelte.dev/docs/svelte/overview), [Getting started](https://svelte.dev/docs/svelte/getting-started), [SvelteKit introduction](https://svelte.dev/docs/kit/introduction), [Creating a project](https://svelte.dev/docs/kit/creating-a-project), [Playground](https://svelte.dev/playground), [Hello world playground](https://svelte.dev/playground/hello-world), [Tutorial](https://svelte.dev/tutorial), [Your first component](https://svelte.dev/tutorial/svelte/your-first-component), [What is SvelteKit? (tutorial)](https://svelte.dev/tutorial/kit/introducing-sveltekit).

Svelte is also a UI framework, not a docs-site generator. It is the closest analog to “a feature directory of small units plus one full app.”

### What try-it is

1. **In-site playground** — docs landing card “I just want to try it out” → [`/playground`](https://svelte.dev/playground) ([docs landing](https://svelte.dev/docs)). Sidebar of named examples; [Create new](https://svelte.dev/playground/untitled). Same origin as the docs (`svelte.dev`), different chrome (example list + editor, not the reference sidebar).
2. **Interactive tutorial** — recommended for newcomers on the docs landing and on SvelteKit introduction. In-browser editor, `solve` button, file tree. Svelte lessons show `src / App.svelte` ([Your first component](https://svelte.dev/tutorial/svelte/your-first-component)). SvelteKit lessons show a **project** tree ([What is SvelteKit?](https://svelte.dev/tutorial/kit/introducing-sveltekit)).
3. **StackBlitz full app** — overview: “You can also try Svelte online in the [playground](/playground) or, if you need a more fully-featured environment, on [StackBlitz](https://sveltekit.new)” ([overview](https://svelte.dev/docs/svelte/overview)). [`https://sveltekit.new`](https://sveltekit.new) redirects to [`https://stackblitz.com/fork/github/sveltejs/kit-template-default?...`](https://stackblitz.com/fork/github/sveltejs/kit-template-default?title=SvelteKit%20Default%20Template&description=The%20default%20SvelteKit%20template%2C%20generated%20with%20create-svelte).

Getting started / Creating a project are **CLI-first** (`npx sv create`); they do not themselves host an editor.

### Artifact that opens

| Door | Unit |
| --- | --- |
| Playground example (e.g. Hello world) | Small Svelte app in the playground file tree; Hello world / first-component tutorials expose **`App.svelte`**. Nested-components and similar examples use more than one file (playground still a component sandbox, not SvelteKit). |
| SvelteKit tutorial | **Full app**: `package.json`, `svelte.config.js`, `vite.config.js`, `src/app.html`, `src/routes/+page.svelte`, `static/` ([tutorial copy](https://svelte.dev/tutorial/kit/introducing-sveltekit): “On the right, in the file tree viewer, you’ll see a handful of files that SvelteKit expects to find in a project.”). |
| `sveltekit.new` | **SvelteKit default template** (StackBlitz title “SvelteKit Default Template”). |

### Organization

**Per-feature gallery** on both playground and tutorial: Introduction, Reactivity, Props, Logic, Events, Bindings, … plus 7GUIs and a few miscellaneous apps (Hacker News). That is a catalog of *language / runtime features*, not of SvelteKit deployment modes. The full-app unit is singular (default template / tutorial project).

### Chrome

- Playground and tutorial **stay on `svelte.dev`** but use **dedicated playground/tutorial chrome**, not the reference-docs layout.
- `sveltekit.new` **leaves** to StackBlitz.

---

## Docusaurus

Primary pages: [homepage](https://docusaurus.io/), [Introduction](https://docusaurus.io/docs), [Installation](https://docusaurus.io/docs/installation), [Playground](https://docusaurus.io/docs/playground), hosted classic-template site [tutorial.docusaurus.io](https://tutorial.docusaurus.io/) / [docs/intro there](https://tutorial.docusaurus.io/docs/intro), [Showcase](https://docusaurus.io/showcase).

### What try-it is

A **chooser page on the docs site** that then **leaves** to CodeSandbox or StackBlitz. Plus a **read-only hosted demo** of the same template.

Homepage hero: [Get Started](/docs) and [Try a Demo](https://docusaurus.new) ([homepage](https://docusaurus.io/)).

Introduction Fast Track:

> Use **[docusaurus.new](https://docusaurus.new)** to test Docusaurus immediately in your browser!
>
> Or read the **[5-minute tutorial](https://tutorial.docusaurus.io)** online.

[`https://docusaurus.new`](https://docusaurus.new) redirects to [`https://docusaurus.io/docs/playground`](https://docusaurus.io/docs/playground) — still on the docs origin. That page:

> Playgrounds allow you to run Docusaurus **in your browser, without installing anything**!
>
> They are mostly useful for: Testing Docusaurus; Reporting bugs.

Options ([playground page](https://docusaurus.io/docs/playground)):

| Control | Redirect (HTTP `Location`) |
| --- | --- |
| CodeSandbox JavaScript | `https://codesandbox.io/p/sandbox/github/facebook/docusaurus/tree/main/examples/classic?file=%2FREADME.md&privacy=public` |
| CodeSandbox TypeScript | `…/examples/classic-typescript?…` |
| StackBlitz JavaScript | `https://stackblitz.com/github/facebook/docusaurus/tree/starter` |
| StackBlitz TypeScript | `https://stackblitz.com/github/facebook/docusaurus/tree/main/examples/classic-typescript` |

StackBlitz is described as using WebContainers to “run Docusaurus directly in your browser.” The page remembers the last choice for later `docusaurus.new` visits.

[`tutorial.docusaurus.io`](https://tutorial.docusaurus.io/) is the **classic template already built and hosted** (title “Hello from My Site | My Site”). It is a demo to *read*, not an editor. Its intro still points back to `docusaurus.new` to try immediately ([tutorial intro](https://tutorial.docusaurus.io/docs/intro)).

[Showcase](https://docusaurus.io/showcase) is other people’s sites, not a try-it sandbox. The MDX docs link [mdxjs.com/playground](https://mdxjs.com/playground/) for **MDX syntax debugging**, not for running Docusaurus ([MDX and React](https://docusaurus.io/docs/markdown-features/react)).

### Artifact that opens

A **full Docusaurus website** — the **classic template** (JS or TS). Installation documents the generated tree ([Installation](https://docusaurus.io/docs/installation)):

```
my-website
├── blog/
├── docs/          # intro + tutorial-basics + tutorial-extras
├── src/pages/     # custom React pages
├── static/
├── docusaurus.config.js
├── package.json
├── sidebars.js
└── …
```

The StackBlitz starter branch is the same shape (`docs/`, `blog/`, `src/`, `docusaurus.config.js`, `.stackblitzrc` with `"startCommand": "npm start"`) ([starter tree](https://github.com/facebook/docusaurus/tree/starter), [.stackblitzrc](https://raw.githubusercontent.com/facebook/docusaurus/starter/.stackblitzrc)). CodeSandbox opens `examples/classic` from `main` ([examples README](https://raw.githubusercontent.com/facebook/docusaurus/main/examples/README.md)).

Inside that site, `docs/intro.mdx` is the 5-minute tutorial and tells the visitor to edit `docs/intro.md` and watch reload ([starter intro](https://raw.githubusercontent.com/facebook/docusaurus/starter/docs/intro.mdx)). The unit is the **whole app**; the first edit target is one doc page.

### Organization

**One kitchen-sink template**, with a JS/TS fork. Not a per-feature catalog (versioning, i18n, search, plugins each as their own starter). The classic template *contains* a multi-page tutorial, a blog, and a homepage — several product features in one project.

### Chrome

Chooser **sits in Docusaurus docs chrome**. The actual editor **leaves** to StackBlitz or CodeSandbox. `tutorial.docusaurus.io` is a separate origin, Docusaurus-generated, no editor.

---

## Comparison

| Site | Try-it form | Unit that opens | Organized by | Chrome |
| --- | --- | --- | --- | --- |
| **VitePress** | StackBlitz via `vitepress.new` | Full init site (`docs/` + `.vitepress/config` + 3 markdown pages). Editor focused on `docs/index.md`. | One kitchen-sink starter | Leaves to StackBlitz |
| **Starlight** | StackBlitz (CodeSandbox secondary) from Getting Started | Full `examples/basics` Starlight app (`astro.config.mjs` + `src/content/docs/`) | One basics template on the docs page; `astro.new` is a named-template gallery (Basics, Blog, Starlight, …) | Leaves to StackBlitz / `astro.new` |
| **Astro** (framework docs) | `astro.new` gallery → StackBlitz / CodeSandbox; tutorial also links a completed blog on StackBlitz | Full app per template | Named product shapes, not per-API features | Leaves docs → `astro.new` → editor host |
| **Vue** | In-docs `@vue/repl` (Tutorial, Examples); standalone SFC Playground; StackBlitz Vite app | One SFC (`App.vue`) or a few components; **or** full Vite app | Per-feature (15 tutorial steps; Basic / Practical / 7 GUIs) **plus** one full-app starter | Tutorial/Examples stay in docs chrome; Playground and StackBlitz leave |
| **Svelte** | In-site playground; interactive tutorial; `sveltekit.new` StackBlitz | `App.svelte` (language); **or** full SvelteKit project (tutorial Kit + default template) | Per-feature gallery (playground + tutorial) **plus** one Kit template | Playground/tutorial stay on `svelte.dev` (dedicated chrome); Kit template leaves to StackBlitz |
| **Docusaurus** | Docs playground chooser (`docusaurus.new`) → CodeSandbox or StackBlitz; hosted read-only classic site | Full classic template (docs + blog + pages + config). JS or TS. | One kitchen-sink (classic ± TypeScript) | Chooser in docs chrome; editor leaves; `tutorial.docusaurus.io` is a built demo |

### Cross-cutting observations (still descriptive)

- **Docs-site tools open a project. UI frameworks open a file (and keep a project door for the app framework).** VitePress / Starlight / Docusaurus never offer a Markdown-only REPL as the official try-it.
- **`.new` shortcuts are the way off-site editors are branded:** `vitepress.new`, `docusaurus.new`, `astro.new`, `sveltekit.new`, `vite.new/vue`.
- **StackBlitz is the shared runtime** for every full-app try-it. Docusaurus and Astro also offer CodeSandbox. Vue/Svelte language try-it does *not* use StackBlitz.
- **Nobody in this set catalogs docs-generator capabilities as separate starters.** Closest: Astro’s template gallery (product *shapes*), Vue/Svelte’s language-feature galleries (not site features), Docusaurus classic packing many features into one tree.
- **In-chrome editors exist only where the product is a component.** Vue Tutorial/Examples and Svelte playground/tutorial keep an editor beside docs chrome. Docs generators stop at a button.
- **A hosted built demo is not the same as try-it.** `tutorial.docusaurus.io` and `astro.new` previews are read-only. Edit-and-see always happens in StackBlitz/CodeSandbox or in a first-party REPL.

---

## Facts later tickets may treat as true

1. VitePress official in-browser try-it is StackBlitz of the init scaffold, entered from Getting Started via `vitepress.new`; the homepage has no try-it control.
2. Starlight official in-browser try-it is StackBlitz of `withastro/starlight` `examples/basics` (full Starlight app). Getting Started does not link markdoc/tailwind examples.
3. Astro’s try-it *directory* lives on `astro.new`, not inside `docs.astro.build` chrome; each card is a whole template, default editor StackBlitz.
4. Docusaurus `docusaurus.new` lands on an in-docs chooser; the editor is CodeSandbox or StackBlitz of the **classic** template (JS or TS), i.e. one kitchen-sink site including docs, blog, and pages.
5. Docusaurus also hosts a built classic site at `tutorial.docusaurus.io` for reading, distinct from the playground editors.
6. Vue’s per-feature try-it is `@vue/repl` **inside** `/tutorial/` and `/examples/` (unit: `App.vue` or a small set of SFCs). The navbar Playground and guide “Try it in the Playground” links **leave** to `play.vuejs.org`. The full-app unit is StackBlitz `vite.new/vue`.
7. Svelte’s per-feature try-it is `/playground` and `/tutorial` on `svelte.dev` (unit: `App.svelte` for language lessons; full Kit tree for Kit lessons). The full-app unit for “more fully-featured environment” is StackBlitz `sveltekit.new`.
8. Among these five, **no docs-site generator** presents a Feature directory of many in-browser starters, one per capability. The standing Playground shape (per-feature Starters + one kitchen-sink, listed in a Feature directory) is **not** copied from VitePress, Starlight, or Docusaurus; the closest structural cousins are Vue/Svelte’s language galleries (wrong product kind) and `astro.new`’s template gallery (right product kind, wrong granularity).
9. If Playground v1 wants visitors to edit a real SveltePress site (config, Markdown pages, dev server), the comparable docs-site move is **leave-the-chrome StackBlitz of a full template**, not an in-article REPL of one file.
10. If Playground v1 wants a Feature directory, that IA would be **additive relative to VitePress/Starlight/Docusaurus**, which each promote a single starter from Getting Started.

Fetched from the live URLs cited above on 2026-09-14. Redirects confirmed via HTTP `Location` headers for `vitepress.new`, `docusaurus.new` and its `/stackblitz`, `/stackblitz-ts`, `/codesandbox`, `/codesandbox-ts` shortcuts, `sveltekit.new`, `vite.new/vue`, and `astro.new/starlight-basics?on=stackblitz`.
