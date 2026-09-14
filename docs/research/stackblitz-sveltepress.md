# Can StackBlitz WebContainers run SveltePress?

Fact ticket for [issue 455](https://github.com/SveltePress/sveltepress/issues/455) (map: [Docs-site Playground, issue 448](https://github.com/SveltePress/sveltepress/issues/448)).

This note answers whether a visitor's browser can install and run a SveltePress project the way `create-sveltepress` scaffolds it — Vite + `@sveltepress/vite` + Default Theme, SvelteKit `adapter-static`, pnpm — inside StackBlitz WebContainers (Classic Editor, Codeflow, or an embed of `template: 'node'`). It is not a product choice. The map's runtime hypothesis is: embed StackBlitz unless this research shows SveltePress cannot run there.

**Bottom line:** WebContainers can run a Node + Vite + SvelteKit **dev** loop of the kind the scaffolder produces. They cannot run the full SveltePress authoring/build surface. Pagefind post-build indexing and preview-origin PWA/service workers fail on documented platform limits. `@sveltepress/cli` versioning is filesystem-only except for an optional git dirty check. Blog-theme OG generation depends on a native addon. This research did **not** obtain a live WebContainer process log (`node --version`, `pnpm --version`, `git --version`) because StackBlitz pages are browser-booted SPAs; HTTP fetches return the editor shell, not a booted runtime.

## Method and limits of this note

Primary sources:

- StackBlitz platform docs on [developer.stackblitz.com](https://developer.stackblitz.com/) (source markdown in [stackblitz/docs](https://github.com/stackblitz/docs)).
- WebContainer API docs on [webcontainers.io](https://webcontainers.io/) (source markdown in [stackblitz/webcontainer-docs](https://github.com/stackblitz/webcontainer-docs)).
- StackBlitz GitHub trackers: [stackblitz/webcontainer-core](https://github.com/stackblitz/webcontainer-core), [stackblitz/sdk](https://github.com/stackblitz/sdk).
- npm package metadata for `@webcontainer/api`, `@stackblitz/sdk`, `pagefind`, `@resvg/resvg-js`.
- This repository at `origin/main` (`fee50efb`).

Not used as the source of a claim: blog recaps, StackBlitz marketing copy that is not also on the docs sites, or third-party “how to use StackBlitz” posts.

**Boot attempt.** Official import URLs were requested over HTTP:

- GitHub importer for the scaffolder TypeScript template: `https://stackblitz.com/fork/github/SveltePress/sveltepress/tree/main/packages/create/template-ts?title=sveltepress-ts-starter` ([importing projects](https://developer.stackblitz.com/guides/user-guide/importing-projects), [launching from GitHub](https://developer.stackblitz.com/guides/integration/open-from-github)). Response title: “sveltepress-ts-starter - StackBlitz”.
- Documented SvelteKit starter `sveltekit.new` → `https://stackblitz.com/fork/github/sveltejs/kit-template-default` ([starter projects](https://developer.stackblitz.com/guides/user-guide/starter-projects)). Response title: “SvelteKit Default Template - StackBlitz”.
- Documented Vite starter `vite.new` → `https://stackblitz.com/fork/github/vitejs/vite/tree/main/packages/create-vite/template-vanilla`. Response title: “Vitejs - Vite (duplicated) - StackBlitz”.
- Documented Node starter `https://stackblitz.com/edit/node`. Response title: “Node.js - StackBlitz”.
- WebContainer API starter `webcontainer.new` → `https://stackblitz.com/fork/github/stackblitz/webcontainer-api-starter` ([introduction](https://webcontainers.io/guides/introduction)).

Those titles prove StackBlitz **accepted** the documented URLs and served the editor HTML. They do **not** prove `pnpm install` / `vite dev` succeeded, because WebContainers boot only after the page runs in a cross-origin-isolated browser tab ([quickstart](https://webcontainers.io/guides/quickstart), [browser support](https://developer.stackblitz.com/platform/webcontainers/browser-support)). This note therefore does not invent a boot log.

**Docs vs runtime drift.** Several StackBlitz pages still say Node 16 or Node 18. StackBlitz maintainers later stated on the tracked Node-version issue that Node 22 is the default. Both are cited; later tickets should treat the **issue comments** as the current runtime and the **roadmap page** as stale until StackBlitz updates it.

---

## What `create-sveltepress` actually scaffolds

`npm create @sveltepress` copies `packages/create/template-js` or `template-ts` ([`packages/create/src/index.ts`](../../packages/create/src/index.ts), [`packages/create/package.json`](../../packages/create/package.json)). Both templates declare:

```json
{
  "packageManager": "pnpm@10.34.5",
  "scripts": { "dev": "vite dev", "build": "vite build" },
  "devDependencies": {
    "@sveltejs/adapter-static": "^3.0.10",
    "@sveltejs/kit": "^2.70.3",
    "@sveltejs/vite-plugin-svelte": "^7.3.0",
    "@sveltepress/theme-default": "^8.9.0",
    "@sveltepress/vite": "^1.8.3",
    "svelte": "^5.57.0",
    "vite": "^8.3.0"
  }
}
```

Sources: [`packages/create/template-ts/package.json`](../../packages/create/template-ts/package.json), [`packages/create/template-js/package.json`](../../packages/create/template-js/package.json).

The Vite config wires Default Theme through `sveltepress()` ([`packages/create/template-ts/vite.config.ts`](../../packages/create/template-ts/vite.config.ts)). `svelte.config.js` registers `.md` as a SvelteKit extension and uses `@sveltejs/adapter-static` with `pages: 'dist'` ([`packages/create/template-ts/svelte.config.js`](../../packages/create/template-ts/svelte.config.js)). The home page is `src/routes/+page.md`; `src/routes/+layout.ts` sets `export const prerender = true`.

The scaffolder does **not** install `@sveltepress/cli`, `@sveltepress/theme-blog`, or enable Default Theme `pwa`. Those are optional extras this ticket still has to score.

Vite 8.3.0 (the template's Vite range) publishes `engines.node` as `^20.19.0 || >=22.12.0` ([registry.npmjs.org/vite/8.3.0](https://registry.npmjs.org/vite/8.3.0)). This repo's assistant guide records the same floor ([`CLAUDE.md`](../../CLAUDE.md)). Template `package.json` files themselves do not set `engines`.

---

## Platform facts (WebContainers / StackBlitz)

### Compute environment

A SveltePress project is a Node + Vite app. On StackBlitz it must use **WebContainers**, not EngineBlock:

| Need | EngineBlock | WebContainers |
| --- | --- | --- |
| Full Node.js | No | Yes |
| Package managers | Turbo v1 only | npm, pnpm, yarn v1 |
| Terminal | No | Yes |
| SDK `template` | `'javascript'`, `'typescript'`, … | `'node'` |

Source: [Available environments](https://developer.stackblitz.com/guides/user-guide/available-environments). SDK templates: [SDK options — ProjectTemplate](https://developer.stackblitz.com/platform/api/javascript-sdk-options#projecttemplate).

WebContainers are a browser-tab Node runtime for Webpack/Vite-class toolchains ([Introduction](https://webcontainers.io/guides/introduction)). Processes are `spawn(command, args)` ([Running processes](https://webcontainers.io/guides/running-processes), [API `spawn`](https://webcontainers.io/api#▸-spawn)). The Classic Editor terminal is documented as the place to run `npm start`, `node index.js`, `ls`, `mkdir`, “and others — the same way you would on your local machine” ([IDE: what’s on your screen](https://developer.stackblitz.com/guides/user-guide/ide-whats-on-your-screen)).

**Implication for SveltePress:** a scaffolder project must be opened as `template: 'node'` (SDK/POST) or as a GitHub import of a folder that contains `package.json`. EngineBlock embeds cannot run it.

### Node version

Documented, conflicting:

- Roadmap “Shipped: **Node 18**. In development: **Node 20**. Future: supporting multiple Node.js versions.” ([Roadmap](https://developer.stackblitz.com/platform/webcontainers/roadmap), GitHub source [roadmap.md](https://github.com/stackblitz/docs/blob/main/docs/platform/webcontainers/roadmap.md)).
- Codeflow FAQ: “Codeflow runs on top of WebContainers, which currently support **Node.js 16**” and “The Node version is locked so currently, there is no ability to change the Node version.” ([Codeflow FAQ](https://developer.stackblitz.com/codeflow/codeflow-faq)).
- Classic Editor FAQ: “The current state of Codeflow does not support users being able to set their own Node version.” ([General FAQs](https://developer.stackblitz.com/guides/user-guide/general-faqs)).

Tracked issue [stackblitz/webcontainer-core#560](https://github.com/stackblitz/webcontainer-core/issues/560) (open, label `tracked`):

- 17 Mar 2026, StackBlitz contributor [SamVerschueren](https://github.com/SamVerschueren): “Node 22 is now the default.” ([comment](https://github.com/stackblitz/webcontainer-core/issues/560#issuecomment-4074154766)).
- 6 Jul 2026, same contributor: WebContainers were upgraded to Node `22.22.3` ([comment](https://github.com/stackblitz/webcontainer-core/issues/560#issuecomment-4894084246)).
- The public `@webcontainer/api` client does not expose a Node-version boot option ([API `BootOptions`](https://webcontainers.io/api#boot-options)).

**Implication for SveltePress:** Vite 8's published engine range is `^20.19.0 || >=22.12.0`. If the runtime is Node 22.22.x, that range is satisfied. If a given StackBlitz surface is still on the documented Node 16/18, `vite@8` install/run is expected to fail `EBADENGINE`. Later tickets should treat **Node as locked, currently 22.x on the default WebContainer runtime, not user-selectable**, and re-check `node --version` in a real tab before shipping an embed.

### Package managers and pnpm

WebContainers natively support npm, pnpm, and yarn v1 ([Available environments](https://developer.stackblitz.com/guides/user-guide/available-environments)). Turbo was removed April 2024; the troubleshooting page still describes the npm-vs-Turbo transition and `ERESOLVE` ([Troubleshooting WebContainers](https://developer.stackblitz.com/platform/webcontainers/troubleshooting-webcontainers), [Turbo package manager](https://developer.stackblitz.com/platform/webcontainers/turbo-package-manager)). Codeflow FAQ: “Currently, Codeflow IDE supports multiple package managers including pnpm, npm, and Yarn.” ([Codeflow FAQ](https://developer.stackblitz.com/codeflow/codeflow-faq)).

WebContainers projects install `dependencies` **and** `devDependencies` from the project's `package.json` ([Managing dependencies with the SDK](https://developer.stackblitz.com/platform/api/javascript-sdk-dependencies)). Auto-install is on by default; `stackblitz.installDependencies` / `.stackblitzrc` can disable it. Default start command prefers `package.json` `"dev"`, then `"start"` ([Project configuration](https://developer.stackblitz.com/platform/webcontainers/project-config)). The scaffolder's `"dev": "vite dev"` matches that default.

StackBlitz docs do **not** pin a pnpm version. The scaffolder pins `packageManager: "pnpm@10.34.5"`. Corepack/`packageManager` enforcement inside WebContainers is not documented on developer.stackblitz.com or webcontainers.io. A later ticket that needs an exact pnpm version must read it from a booted terminal.

Keep a lockfile when importing from GitHub: “If the `package-lock.json` file exists in the imported project, a package manager doesn't have to do the work needed to resolve dependencies” ([Launching projects from GitHub](https://developer.stackblitz.com/guides/integration/open-from-github)). The scaffolder templates ship **no** lockfile.

Native addons cannot load. WebContainers start Node with `--no-addons`. Error: `Cannot load native addon because loading addons is disabled`. Workaround: JS or WASM ([Troubleshooting](https://developer.stackblitz.com/platform/webcontainers/troubleshooting-webcontainers), [webcontainers.io troubleshooting](https://webcontainers.io/guides/troubleshooting)).

**Implication for SveltePress:** `pnpm` as a command is in the supported set. The scaffolder's `devDependencies` are installed. Anything that `dlopen`s a `.node` binary (Pagefind indexer, `@resvg/resvg-js`) is out.

### Filesystem

WebContainers expose a **virtual in-memory filesystem**. Host API: `mount`, `fs.readFile` / `writeFile` / `mkdir` / `readdir` / `rm` / `rename` / `watch` ([Working with the file system](https://webcontainers.io/guides/working-with-the-file-system), [API FileSystemAPI](https://webcontainers.io/api#filesystemapi)).

In the Classic Editor, editor edits are synced into that FS according to `compileTrigger` (`auto` | `keystroke` | `save`; default `auto`). Syncing to the in-memory FS is **not** the same as persisting the project on stackblitz.com; persistence needs an explicit Save ([Project configuration](https://developer.stackblitz.com/platform/webcontainers/project-config)). SDK-created projects “only live in the browser’s memory — unless a user forks the project” ([JavaScript SDK](https://developer.stackblitz.com/platform/api/javascript-sdk)). Codeflow: unsaved edits are session-local ([Working in Codeflow IDE](https://developer.stackblitz.com/codeflow/working-in-codeflow-ide)).

SDK `ProjectFiles` are **text only**. “Binary files (such as archive formats, binaries and executables, bitmap images, audio and video files) are not supported at this time.” ([SDK options — ProjectFiles](https://developer.stackblitz.com/platform/api/javascript-sdk-options#projectfiles)). The POST API repeats that warning ([POST API](https://developer.stackblitz.com/platform/api/post-api)). The scaffolder's `static/sveltepress@3x.png` therefore cannot go through `sdk.openProject` / POST; GitHub import or a later upload path is required for binary assets. SVG is allowed (`static/sveltepress.svg`).

WebContainer `fs.watch` exists from `@webcontainer/api` 1.1.8 ([changelog](https://webcontainers.io/changelog)). Vite HMR depends on file-change events reaching the in-memory FS; Classic Editor `compileTrigger: "auto"` writes on a short delay after typing.

**Implication for SveltePress:** writing `.sveltepress/live-code/*.svelte` and `.sveltepress/live-code/live-code-map.json` is an ordinary `fs.writeFile` / `mkdir` on the virtual disk. It is not blocked by WebContainer FS APIs. It is also not persisted unless the user Saves/forks. The template `.gitignore` ignores `.sveltepress`, so generated live-code files would not be committed even if git were used.

### Git

StackBlitz product copy: “all development is happening in your browser tab, including running Node.js and git” ([What is StackBlitz?](https://developer.stackblitz.com/guides/user-guide/what-is-stackblitz)). Codeflow: the same sentence plus package managers ([What is Codeflow?](https://developer.stackblitz.com/codeflow/what-is-codeflow)). Codeflow currently supports **GitHub.com repositories only**, not arbitrary git remotes ([Codeflow FAQ](https://developer.stackblitz.com/codeflow/codeflow-faq)).

Git binary history:

- 2021: `jsh: command not found: git` / `No git binary found in $PATH` ([webcontainer-core#144](https://github.com/stackblitz/webcontainer-core/issues/144)).
- 25 Oct 2022: StackBlitz contributor closed that issue because “we recently released [Codeflow](https://stackblitz.com/codeflow) which comes with a git binary” ([comment](https://github.com/stackblitz/webcontainer-core/issues/144#issuecomment-1290412457)).
- 22 Jan 2024: a user asked how to get that git binary in a headless `@webcontainer/api` instance; no maintainer answer that it is exposed on the public API ([comment](https://github.com/stackblitz/webcontainer-core/issues/144#issuecomment-1903328892)).
- Classic Editor GitHub import is a **host-side** clone of a public repo into a project, not a guest `git clone` ([Importing projects](https://developer.stackblitz.com/guides/user-guide/importing-projects)). Private GitHub import is a membership feature.

`@webcontainer/api` documents `spawn` of `npm` / `yarn` / arbitrary commands but does not list `git` as a guaranteed binary ([Running processes](https://webcontainers.io/guides/running-processes)).

**Implication for SveltePress:** treat **git CLI as present in Codeflow (and in Classic Editor projects that imported GitHub)**, not as a documented guarantee of every WebContainer, and not as part of `@webcontainer/api`. `@sveltepress/cli` `versions create` calls `git rev-parse` / `git status` only to refuse a dirty tree; if `git` is missing, `assertCleanGit` catches the failure and **skips** the check (see CLI section). Version artifacts themselves do not require git.

### Network, preview, cookies, memory

- HTTP servers inside the container get a preview URL via `server-ready` / `port` events ([Running processes](https://webcontainers.io/guides/running-processes), [API `on`](https://webcontainers.io/api#on)). Classic Editor shows that preview in an iframe; “Open in New Window” is supported ([IDE: what’s on your screen](https://developer.stackblitz.com/guides/user-guide/ide-whats-on-your-screen)).
- Product FAQ: “the server is unreachable outside of the browser” (no Postman) ([General FAQs](https://developer.stackblitz.com/guides/user-guide/general-faqs)). Direct TCP databases are unsupported; HTTP APIs are the documented alternative.
- Preview origins are `*.webcontainer.io` / `*.webcontainer-api.io` / `*.stackblitz.io` ([Browser configuration](https://developer.stackblitz.com/platform/webcontainers/browser-config)).
- WebContainers **require** `SharedArrayBuffer` and cross-origin isolation (COOP/COEP). Embedding WebContainer projects is documented as **Chromium-only** because Firefox/Safari lack `credentialless` COEP ([Browser support](https://developer.stackblitz.com/platform/webcontainers/browser-support), [Quickstart](https://webcontainers.io/guides/quickstart)).
- Cookie / third-party storage blockers prevent the StackBlitz **host** service worker from installing; projects then stick on boot ([Browser configuration](https://developer.stackblitz.com/platform/webcontainers/browser-config), [webcontainers.io troubleshooting](https://webcontainers.io/guides/troubleshooting)).
- CORS from inside the container: StackBlitz contributor documents `.stackblitzrc` `{ "corsProxy": true }` ([webcontainer-core#846 comment](https://github.com/stackblitz/webcontainer-core/issues/846#issuecomment-2796559122)). Roadmap still lists “CORS Proxy” under In Development ([Roadmap](https://developer.stackblitz.com/platform/webcontainers/roadmap)).
- Memory: many simultaneous editors/embeds can `RangeError: WebAssembly.instantiate(): Out of memory` ([webcontainers.io troubleshooting](https://webcontainers.io/guides/troubleshooting), [Working in Codeflow IDE](https://developer.stackblitz.com/codeflow/working-in-codeflow-ide)). Android/iOS are more constrained ([Browser support](https://developer.stackblitz.com/platform/webcontainers/browser-support)).
- One `WebContainer.boot()` per page ([Quickstart](https://webcontainers.io/guides/quickstart)).

### Service workers in the **preview** (not the host)

StackBlitz's own networking stack uses a service worker on the preview origin. Official troubleshooting:

> At this time, it is not possible to install your own Service Worker with WebContainer as our own Service Worker is used as a core component of the networking stack.

Source: [Troubleshooting WebContainers](https://developer.stackblitz.com/platform/webcontainers/troubleshooting-webcontainers).

Tracked request [webcontainer-core#846](https://github.com/stackblitz/webcontainer-core/issues/846) (open): StackBlitz: “WebContainer does not support registering a SW on the served page” ([comment](https://github.com/stackblitz/webcontainer-core/issues/846#issuecomment-1283812562)); later “tracked… we do want to support in the future - but it might be difficult” ([comment](https://github.com/stackblitz/webcontainer-core/issues/846#issuecomment-1293620841)). Still open as of 2025-04-11.

**Implication for SveltePress:** Default Theme PWA (`navigator.serviceWorker.register` via `virtual:pwa-register/svelte`) cannot own the preview origin. Host-side StackBlitz SWs are unrelated to the user's PWA.

---

## Feature-by-feature

Verdict key: **works in principle** = platform + SveltePress source say this is ordinary Node/Vite/FS. **fails** = a documented platform limit contradicts the feature. **not observed** = would need a live tab.

### 1. `pnpm dev` / HMR of `.md` routes — works in principle (dev loop); not observed

SveltePress side:

- Template script is `"dev": "vite dev"`.
- `@sveltepress/vite` injects `sveltekit()` and treats `src/routes/**/+page.md` (and layouts) as wrap targets (`PAGE_OR_LAYOUT_RE` in [`packages/vite/src/plugin.ts`](../../packages/vite/src/plugin.ts)).
- `handleHotUpdate` re-reads those files through `getWrappedCode` “so that sveltekit can handle the HMR” ([`packages/vite/src/plugin.ts`](../../packages/vite/src/plugin.ts) around the `handleHotUpdate` hook).
- `.md` is forced into SvelteKit `extensions` ([`packages/vite/src/utils/resolve-svelte-kit-options.ts`](../../packages/vite/src/utils/resolve-svelte-kit-options.ts)).

Platform side:

- Vite is an explicitly supported toolchain ([Introduction](https://webcontainers.io/guides/introduction)).
- WebContainers have a terminal and `spawn` for `pnpm` / `npm run dev` ([Available environments](https://developer.stackblitz.com/guides/user-guide/available-environments), [Project configuration](https://developer.stackblitz.com/platform/webcontainers/project-config)).
- File edits sync into the in-memory FS (`compileTrigger`) so a watching dev server can rebuild ([Project configuration](https://developer.stackblitz.com/platform/webcontainers/project-config)).
- `fs.watch` exists on the public API ([changelog](https://webcontainers.io/changelog)).

Caveats that later tickets must not ignore:

- Exact `pnpm` version vs `packageManager: pnpm@10.34.5` is undocumented.
- If the surface is still on Node 16/18 (stale docs), Vite 8 will refuse to run.
- GitHub-import of `packages/create/template-ts` is the documented way to open the scaffold; SDK/POST cannot include the PNG hero image.
- HMR of `.md` is Vite + SvelteKit + the wrap plugin, not a WebContainer special case. If Vite HMR works, `.md` HMR should work; this was not executed in a tab.

### 2. Default Theme Live code (writes `.sveltepress/live-code`) — works in principle on the virtual FS

[`packages/theme-default/src/markdown/live-code.ts`](../../packages/theme-default/src/markdown/live-code.ts):

- `BASE_PATH = resolve(process.cwd(), '.sveltepress/live-code')`.
- For ` ```svelte live ` blocks, unless `emitPageArtifactFile` already stored a version artifact, it `mkdirSync`s that directory, maintains `live-code-map.json`, and `writeFileSync`s `LiveCode<uid>.svelte`.
- Imports become `/.sveltepress/live-code/${name}`.
- `@sveltepress/vite` also creates `.sveltepress` at plugin load (`BASE_PATH` in [`packages/vite/src/plugin.ts`](../../packages/vite/src/plugin.ts)).

WebContainers FS supports `mkdir` (recursive) and `writeFile` of UTF-8 sources ([Working with the file system](https://webcontainers.io/guides/working-with-the-file-system)). Live-code output is text `.svelte` / `.json`, not a native binary.

Caveats:

- Generated files live in volatile in-memory FS until Save/fork ([Project configuration](https://developer.stackblitz.com/platform/webcontainers/project-config), [SDK data persistence](https://developer.stackblitz.com/platform/api/javascript-sdk)).
- Template `.gitignore` ignores `.sveltepress`.
- The default home `+page.md` has **no** live block, so a virgin scaffold will not exercise this path until the visitor adds one.

### 3. Pagefind post-build search — fails (native indexer)

SveltePress side: `@sveltepress/vite` always attaches a `closeBundle` plugin unless `pagefind: false`. It `import('pagefind')`, `createIndex`, `index.addDirectory({ path: siteDir })`, `index.writeFiles` ([`packages/vite/src/pagefind.ts`](../../packages/vite/src/pagefind.ts), wired in [`packages/vite/src/index.ts`](../../packages/vite/src/index.ts)). Default Theme search UI then loads `/pagefind/pagefind.js` from the built site. The scaffolder does not set `pagefind: false`, so `vite build` attempts indexing.

Pagefind's Node API “communicate[s] with the native Pagefind binary in the background” ([Pagefind Node API](https://pagefind.app/docs/node-api/)). npm `pagefind@1.5.2` optionalDependencies are platform packages such as `@pagefind/linux-x64` (description: “The platform-specific binary for pagefind on linux/x64”, unpacked size ~58 MB) ([registry pagefind@1.5.2](https://registry.npmjs.org/pagefind/1.5.2), [registry @pagefind/linux-x64@1.5.2](https://registry.npmjs.org/@pagefind/linux-x64/1.5.2)). Maintainer: a WASM indexer is not provided; Node/Python wrap the native binary ([Pagefind discussion #790](https://github.com/Pagefind/pagefind/discussions/790)).

WebContainers: native addons/binaries that are not WASM cannot run; Node is started with `--no-addons` ([Troubleshooting](https://developer.stackblitz.com/platform/webcontainers/troubleshooting-webcontainers)).

**What still works:** serving a **prebuilt** `pagefind/` directory (as this repo's version-deltas already freeze) is static files. Generating that directory **inside** the container during `vite build` is the part that fails.

`sveltepress versions build` calls `vite.build()` ([`packages/cli/src/incremental.ts`](../../packages/cli/src/incremental.ts)), so it hits the same post-bundle indexer unless `SVELTEPRESS_SKIP_PAGEFIND` is set ([`packages/vite/src/index.ts`](../../packages/vite/src/index.ts)).

### 4. `@sveltepress/cli` `sveltepress versions init|create|build` — init/create/list mostly work; build's Pagefind step fails; git is optional

The scaffolder does not include `@sveltepress/cli`. A playground that wants versioning must add it.

CLI surface ([`packages/cli/src/index.ts`](../../packages/cli/src/index.ts), [`packages/cli/package.json`](../../packages/cli/package.json)):

| Command | What it needs | WebContainer fit |
| --- | --- | --- |
| `versions init` | Write `sveltepress.versions.json` (text) | Ordinary `writeFile`. No git. |
| `versions create` | Copy/snapshot route files, write manifests / source deltas / content-addressed artifacts under `.sveltepress/version-artifacts` (default) | Ordinary FS. Optional `assertCleanGit`: `execFileSync('git', ['rev-parse', '--is-inside-work-tree'])`; if git is missing the function **returns** and does not throw; if git exists and the tree is dirty, create fails unless `--allow-dirty`. |
| `versions list` / `validate` / `plan` | Read manifests | FS only. |
| `versions build` / `compose` | Generate historical shells, `vite.build()`, Pagefind closeBundle | Vite build is the same as (1)+(3). Pagefind step fails. Artifact store writes are FS. |
| `versions publish` / `migrate` / `gc` | Manifest + artifact FS | FS only. |

Git isolation exists so nested `git add` does not inherit `GIT_DIR` from a parent hook ([`isolatedGitEnv`](../../packages/cli/src/index.ts)). That path is test/CI, not required to freeze a version.

Codeflow has a git binary ([webcontainer-core#144 close comment](https://github.com/stackblitz/webcontainer-core/issues/144#issuecomment-1290412457)); headless `@webcontainer/api` does not document one. Dirty-check behavior therefore depends on which StackBlitz surface is used, but **versioning does not need git to function**.

Content-addressed artifacts are files on the virtual disk. They vanish with the session unless Saved/forked ([SDK persistence](https://developer.stackblitz.com/platform/api/javascript-sdk)).

### 5. PWA / service worker inside the preview — fails

Default Theme PWA is **opt-in** (`defaultTheme({ pwa: … })`). The scaffolder does not enable it. Docs-site does ([`packages/docs-site/config/pwa.ts`](../../packages/docs-site/config/pwa.ts)).

When `options.pwa` is set, the theme injects `SvelteKitPWA` from `@vite-pwa/sveltekit` and a Workbox generateSW/injectManifest pipeline ([`packages/theme-default/src/index.ts`](../../packages/theme-default/src/index.ts)). Runtime registration is `useRegisterSW` from `virtual:pwa-register/svelte` ([`packages/theme-default/src/components/pwa/ReloadPrompt.svelte`](../../packages/theme-default/src/components/pwa/ReloadPrompt.svelte)). `SERVICE_WORKER_PATH` points at `node_modules/@sveltepress/theme-default/dist/components/pwa/sw.js` ([`packages/theme-default/src/constants.ts`](../../packages/theme-default/src/constants.ts)).

WebContainers forbid a **guest** service worker on the preview origin because StackBlitz already installed one for networking ([Troubleshooting](https://developer.stackblitz.com/platform/webcontainers/troubleshooting-webcontainers), [webcontainer-core#846](https://github.com/stackblitz/webcontainer-core/issues/846)).

Without `pwa`, the theme stubs `virtual:pwa-info` / `virtual:pwa-register/svelte` so the layout still compiles ([`packages/theme-default/src/index.ts`](../../packages/theme-default/src/index.ts)). A scaffolded playground that never sets `pwa` will not attempt registration.

### 6. Blog theme (`@sveltepress/theme-blog`) — mixed: Vite/markdown index should run; OG PNG generation fails native; Pagefind CLI in the example also fails

Not part of `create-sveltepress`. Example app: [`packages/example-blog/package.json`](../../packages/example-blog/package.json) (`"dev": "vite dev"`, `"build": "vite build && pagefind --site dist"`).

Dev path ([`packages/theme-blog/src/vite-plugin.ts`](../../packages/theme-blog/src/vite-plugin.ts), [`packages/theme-blog/src/index.ts`](../../packages/theme-blog/src/index.ts)):

- Reads `src/posts/*.md`, writes JSON under `.sveltepress/posts|tags|categories` — text FS, same as live-code.
- Optionally writes `static/rss.xml` — text.
- On `buildStart`, if `ogImage.enabled !== false` (default on), `renderOgImage` uses `satori` + `new Resvg(...)` from `@resvg/resvg-js` ([`packages/theme-blog/src/og-image.ts`](../../packages/theme-blog/src/og-image.ts)). Failures are `console.warn` and the rest of the plugin continues.

`@resvg/resvg-js@2.6.2` is a napi-rs native addon (`optionalDependencies` like `@resvg/resvg-js-linux-x64-gnu`) ([registry @resvg/resvg-js@2.6.2](https://registry.npmjs.org/@resvg/resvg-js/2.6.2)). That is exactly the class WebContainers disable ([Troubleshooting](https://developer.stackblitz.com/platform/webcontainers/troubleshooting-webcontainers)). The package documents a separate WASM build (`@resvg/resvg-wasm`); SveltePress does not use it.

Example-blog `pagefind --site dist` is the same native binary as (3).

**Implication:** a blog-theme **dev** playground can be attempted if OG generation is disabled (`ogImage: { enabled: false }`) and Pagefind is not required at build. Out of the box, `buildStart` will try Resvg and warn; `vite build && pagefind` will fail indexing.

---

## How a visitor would open a scaffolded project

Documented StackBlitz entry points that match a SveltePress app:

1. **GitHub import of a folder that is already a complete app**  
   `https://stackblitz.com/fork/github/{user}/{repo}/tree/{ref}/{dir}?startScript=dev`  
   ([Importing projects](https://developer.stackblitz.com/guides/user-guide/importing-projects), [Launching from GitHub](https://developer.stackblitz.com/guides/integration/open-from-github)).  
   This repo's templates live at `packages/create/template-ts` and `template-js`. HTTP GET of the fork URL returned the editor shell titled “sveltepress-ts-starter - StackBlitz”. That is **not** a runtime success.

2. **SDK / POST `template: 'node'`** with a files map of the template **text** files and a `package.json` listing the same deps ([SDK](https://developer.stackblitz.com/platform/api/javascript-sdk), [SDK options](https://developer.stackblitz.com/platform/api/javascript-sdk-options), [POST API](https://developer.stackblitz.com/platform/api/post-api)). Binary PNG cannot be included. Set `stackblitz.startCommand` / `startScript=dev` so the editor runs `vite dev` after install ([Project configuration](https://developer.stackblitz.com/platform/webcontainers/project-config)).

3. **Codeflow** `pr.new/github.com/{user}/{repo}` for a dedicated example repo ([Working in Codeflow IDE](https://developer.stackblitz.com/codeflow/working-in-codeflow-ide)). Best git story; still WebContainers, still no guest SW, still no native Pagefind.

4. **Do not** use EngineBlock templates (`javascript`, `typescript`, …). They have no Node and no terminal ([Available environments](https://developer.stackblitz.com/guides/user-guide/available-environments)).

Official SvelteKit/Vite starters (`sveltekit.new`, `vite.new`) prove StackBlitz already hosts this class of app; they are not SveltePress.

Embedding: WebContainer embeds are Chromium-only and the **embedding page** must be cross-origin isolated or the embed shows the isolation error ([Browser support — Embedding](https://developer.stackblitz.com/platform/webcontainers/browser-support#embedding)). `ctl=1` (click-to-load) is documented for embeds ([Embedding projects](https://developer.stackblitz.com/guides/integration/embedding)). One boot per page ([Quickstart](https://webcontainers.io/guides/quickstart)).

---

## Scoreboard

| Capability | Verdict | Why |
| --- | --- | --- |
| Open scaffold as WebContainers Node project | **Supported by docs**; editor URL resolved; **runtime not observed** | `template: 'node'` / GitHub import; HTTP returned editor HTML only |
| `pnpm` / `npm` install of template `devDependencies` | **Supported** | Native pnpm/npm; WebContainers install `devDependencies` |
| `pnpm dev` / `vite dev` | **Supported in principle** | Vite is a documented WebContainer workload; `"dev"` is the default start script |
| HMR of `.md` routes | **Supported in principle** | Plugin `handleHotUpdate` + in-memory FS sync; not executed |
| Live code write `.sveltepress/live-code` | **Supported in principle** | Text `mkdir`/`writeFile` on virtual FS; volatile until Save |
| `vite build` (SvelteKit adapter-static) | **Supported in principle except Pagefind hook** | JS/WASM toolchain; closeBundle indexer is native |
| Pagefind post-build index | **Fails** | Native `@pagefind/*` binary + `--no-addons` |
| `sveltepress versions init` | **Supported in principle** | JSON write |
| `sveltepress versions create` | **Supported in principle** | FS artifacts; git dirty-check skipped if `git` missing |
| `sveltepress versions build` | **Fails at Pagefind**; rest is Vite+FS | Same as `vite build` |
| PWA / SW on preview origin | **Fails** | Guest SW forbidden |
| Blog theme markdown index / RSS | **Supported in principle** | Text FS |
| Blog theme OG PNGs (`@resvg/resvg-js`) | **Fails** (warns, continues) | napi native addon |
| Embed on docs.sveltepress.site | **Chromium-only**; needs COOP/COEP on the **host** page | Browser support embedding section |

SveltePress **can** run in WebContainers as a Vite dev playground of the scaffolder. SveltePress **cannot** run there as a full replica of local `vite build` + Pagefind + PWA. That is not “SveltePress cannot run there”; it is “the production/search/PWA slice cannot.” The map hypothesis (embed StackBlitz unless SveltePress cannot run) survives for a **dev playground**, not for “click build and get a searchable PWA.”

---

## Facts later tickets may treat as true

1. A SveltePress playground on StackBlitz must use **WebContainers** (`template: 'node'` or a GitHub import of a Node app), not EngineBlock. Source: [Available environments](https://developer.stackblitz.com/guides/user-guide/available-environments), [SDK ProjectTemplate](https://developer.stackblitz.com/platform/api/javascript-sdk-options#projecttemplate).

2. WebContainers natively run **npm, pnpm, and yarn v1**, and install both `dependencies` and `devDependencies` from `package.json`. Source: [Available environments](https://developer.stackblitz.com/guides/user-guide/available-environments), [SDK dependencies](https://developer.stackblitz.com/platform/api/javascript-sdk-dependencies).

3. Default start after install is the `"dev"` script if present. The scaffolder's `"dev": "vite dev"` matches. Source: [Project configuration](https://developer.stackblitz.com/platform/webcontainers/project-config), [`packages/create/template-ts/package.json`](../../packages/create/template-ts/package.json).

4. Node version is **locked and not user-selectable**. Official roadmap still lists Node 18 shipped / Node 20 in development; StackBlitz stated on 2026-03-17 that **Node 22 is the default** and on 2026-07-06 that the runtime is **22.22.3**. Source: [Roadmap](https://developer.stackblitz.com/platform/webcontainers/roadmap), [Codeflow FAQ](https://developer.stackblitz.com/codeflow/codeflow-faq), [webcontainer-core#560](https://github.com/stackblitz/webcontainer-core/issues/560). Re-read `node --version` in a tab before relying on the patch level.

5. Vite 8 (template `vite: ^8.3.0`) requires `^20.19.0 || >=22.12.0`. Source: [vite@8.3.0 engines](https://registry.npmjs.org/vite/8.3.0), [`CLAUDE.md`](../../CLAUDE.md).

6. The filesystem is **in-memory**. Editor `compileTrigger` (default `auto`) writes into it; persistence to stackblitz.com requires Save/fork. Source: [Project configuration](https://developer.stackblitz.com/platform/webcontainers/project-config), [SDK](https://developer.stackblitz.com/platform/api/javascript-sdk).

7. SDK/POST project files are **text-only**; PNG/binaries are unsupported. GitHub import is the documented path that can include binaries. Source: [SDK ProjectFiles](https://developer.stackblitz.com/platform/api/javascript-sdk-options#projectfiles), [POST API](https://developer.stackblitz.com/platform/api/post-api), [Importing projects](https://developer.stackblitz.com/guides/user-guide/importing-projects).

8. Native addons are disabled (`--no-addons`). Source: [Troubleshooting](https://developer.stackblitz.com/platform/webcontainers/troubleshooting-webcontainers).

9. **Pagefind indexing cannot run inside WebContainers.** `pagefind` Node API wraps a platform binary (`@pagefind/linux-x64` etc.). Source: [Pagefind Node API](https://pagefind.app/docs/node-api/), [pagefind@1.5.2](https://registry.npmjs.org/pagefind/1.5.2), [`packages/vite/src/pagefind.ts`](../../packages/vite/src/pagefind.ts). Prebuilt `pagefind/` assets can still be served as static files.

10. **Guest service workers cannot register on the preview origin.** Default Theme PWA (`useRegisterSW`) will not work in the StackBlitz preview. Source: [Troubleshooting](https://developer.stackblitz.com/platform/webcontainers/troubleshooting-webcontainers), [webcontainer-core#846](https://github.com/stackblitz/webcontainer-core/issues/846), [`packages/theme-default/src/components/pwa/ReloadPrompt.svelte`](../../packages/theme-default/src/components/pwa/ReloadPrompt.svelte).

11. Live-code generation is `mkdir`/`writeFile` under `.sveltepress/live-code` and is allowed by the virtual FS. Source: [`packages/theme-default/src/markdown/live-code.ts`](../../packages/theme-default/src/markdown/live-code.ts), [File system guide](https://webcontainers.io/guides/working-with-the-file-system).

12. `@sveltepress/cli` versioning is filesystem + Vite. Git is only a dirty-tree guard and is skipped when `git` is absent. Source: [`packages/cli/src/index.ts`](../../packages/cli/src/index.ts) (`assertCleanGit`, `initializeVersions`, `createVersion`).

13. Codeflow documents a **git binary**; the public WebContainer API does not. Codeflow git remotes are GitHub.com only. Source: [webcontainer-core#144](https://github.com/stackblitz/webcontainer-core/issues/144), [Codeflow FAQ](https://developer.stackblitz.com/codeflow/codeflow-faq), [What is Codeflow?](https://developer.stackblitz.com/codeflow/what-is-codeflow).

14. Blog-theme OG images use `@resvg/resvg-js` (napi). That fails under `--no-addons`. The plugin warns and continues. Source: [`packages/theme-blog/src/og-image.ts`](../../packages/theme-blog/src/og-image.ts), [resvg-js@2.6.2](https://registry.npmjs.org/@resvg/resvg-js/2.6.2), [Troubleshooting](https://developer.stackblitz.com/platform/webcontainers/troubleshooting-webcontainers).

15. WebContainer **embeds** are documented for Chromium only; the embedding document must be cross-origin isolated. One WebContainer per page. Cookie blockers break boot. Source: [Browser support](https://developer.stackblitz.com/platform/webcontainers/browser-support), [Quickstart](https://webcontainers.io/guides/quickstart), [Browser configuration](https://developer.stackblitz.com/platform/webcontainers/browser-config).

16. Preview servers are not reachable from outside the browser (no Postman/TCP DBs). Source: [General FAQs](https://developer.stackblitz.com/guides/user-guide/general-faqs).

17. This research **did not** capture a live `node --version`, `pnpm --version`, or `git --version` from a booted container. HTTP fetches of documented project URLs returned editor HTML titles only.

18. Scaffolder templates: Vite + `@sveltepress/vite` + Default Theme + `adapter-static` + `packageManager: pnpm@10.34.5`. They do **not** include `@sveltepress/cli`, `@sveltepress/theme-blog`, or `pwa`. Source: [`packages/create/template-ts/`](../../packages/create/template-ts/).
