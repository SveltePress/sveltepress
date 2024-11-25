# Contributing

The Open Source Guides website has a collection of resources for individuals, communities, and companies. These resources help people who want to learn how to run and contribute to open source projects. Contributors and people new to open source alike will find the following guides especially useful:

* [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
* [Building Welcoming Communities](https://opensource.guide/building-community/)

## Get involved

There are many ways to contribute to Sveltepress, and many of them do not involve writing any code. Here's a few ideas to get started:

* Simply start using sveltepress. Go through [Quick start](https://sveltepress.site/guide/quick-start/) guide. Does everything work as expected? If not, we're always looking for improvements. Let us know by opening an issue.
* Look through the [open issues](https://github.com/SveltePress/sveltepress/issues). A good starting point would be issues tagged good first issue. Provide workarounds, ask for clarification, or suggest labels. Help triage issues.
* If you find an issue you would like to fix, open a pull request.
* Read through the docs site. If you find anything that is confusing or can be improved, you can make edits by clicking "Suggest changes to this page" at the bottom of the page.

## Bugs

We use [GitHub issues](https://github.com/SveltePress/sveltepress/issues) for our public bugs. If you would like to report a problem, take a look around and see if someone already opened an issue about it. If you are certain this is a new unreported bug, you can [submit a bug report](https://github.com/sveltejs/svelte/issues/new/choose).

## Pull requests

### Proposing a change

If you would like to request a new feature or enhancement but are not yet thinking about opening a pull request, you can also file an issue with [feature template](https://github.com/SveltePress/sveltepress/issues/new?assignees=&labels=enhancement&template=feature_request.yml&title=feature+brief+description).

If you're only fixing a bug, it's fine to submit a pull request right away, but we still recommend that you file an issue detailing what you're fixing. This is helpful in case we don't accept that specific fix but want to keep track of the issue.

Small pull requests are much easier to review and more likely to get merged.

### Creating a branch

[Fork the repository](https://github.com/SveltePress/sveltepress/fork) and create your branch from master. If you've never sent a GitHub pull request before, you can learn how from [this free video series](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

### Installation

* Make sure you have [PNPM](https://pnpm.io/) and Node > 16 installed
* Run `pnpm install` in the project root

### Testing

Use [Vitest](https://vitest.dev/) for testing.

All tests are located in `packages/[package name]/__test__` folder.

To run test, run `pnpm test` in the package root.

### Develop docs site

* run `cd packages/docs-site`
* run `pnpm dev`
* Open the address in the terminal to see local started docs site

### Develop vite plugin package

**Please provide test cases if possible**

If you've changed APIs, update the documentation.

### Develop default theme package

**Please provide test cases if possible**

If you've changed APIs, update the documentation.

If you've changed UI components. Provide screenshots about before and after changes made.

## Style guide

### Lint

Use [Eslint](https://eslint.org/) and [Prettier](https://prettier.io/) to restrict the format of codes.

* If a js or a ts file changed, use eslint to check it.
* If a svelte file changed, use eslint and prettier to check it.

### Naming convention

* Svelte component filename in `CamelCase`
* js and ts filename in `kebab-case`
* function and variable name in `camelCase`

### Submitting pull requests

* Make sure `pnpm lint` ran and no error were found.
* Make sure `pnpm test` ran in the package changes made and no error were found.
* If a version update is considered required. Welcome using [Changesets](https://github.com/changesets/changesets) by running `npx changesets` to add one in pull request.

Looking forward to contributions in any forms .
