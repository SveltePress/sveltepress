---
description: Guides versioning and publishing Sveltepress packages using Changesets. Use when the user wants to create a changeset, bump package versions, publish to npm, prepare a release, or check changeset status.
---

# Publish Skill - Changesets Workflow

This skill enables Claude to help with versioning and publishing Sveltepress packages using Changesets.

## Overview

Sveltepress uses [Changesets](https://github.com/changesets/changesets) for managing versions and publishing packages in this monorepo. Changesets provides a way to manage versioning and changelogs with a focus on monorepos.

## Configuration

- **Tool**: `@changesets/cli`
- **Changelog Generator**: `@changesets/changelog-github`
- **Repository**: `Blackman99/sveltepress`
- **Access**: Public
- **Base Branch**: `main`
- **Config Location**: `.changeset/config.json`

## Workflow

### 1. Creating a Changeset

When you make changes that should be released, create a changeset to document them:

```bash
# Interactive mode - prompts for package selection and change type
pnpm changeset

# Or use npx
npx changeset
```

The CLI will ask:
1. **Which packages to include** - Select from:
   - `@sveltepress/create`
   - `@sveltepress/theme-default`
   - `@sveltepress/twoslash`
   - `@sveltepress/vite`

2. **Change type** for each package:
   - `major` - Breaking changes (1.0.0 → 2.0.0)
   - `minor` - New features (1.0.0 → 1.1.0)
   - `patch` - Bug fixes (1.0.0 → 1.0.1)

3. **Summary** - Brief description of changes

This creates a markdown file in `.changeset/` with format:
```markdown
---
'@sveltepress/theme-default': patch
'@sveltepress/vite': minor
---

Add support for custom markdown transformations
```

### 2. Manual Changeset Creation

You can also create changeset files manually:

```bash
# Create a file in .changeset/ with a unique name
touch .changeset/my-feature-name.md
```

Format:
```markdown
---
'package-name': major | minor | patch
---

Description of the changes
```

### 3. Versioning Packages

To consume all changesets and update package versions:

```bash
# This will:
# 1. Update package.json versions
# 2. Update CHANGELOG.md files
# 3. Delete consumed changeset files
pnpm changeset version
```

### 4. Publishing to NPM

After versioning, publish the packages:

```bash
# Build packages first (if needed)
pnpm build  # or equivalent build command

# Publish to npm
pnpm release

# Or manually
pnpm changeset publish
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm changeset` | Create a new changeset interactively |
| `pnpm changeset add` | Alias for creating a changeset |
| `pnpm changeset version` | Consume changesets and update versions |
| `pnpm changeset publish` | Publish changed packages to npm |
| `pnpm changeset status` | Check which packages have changesets |
| `pnpm release` | Project alias for `changeset publish` |

## Best Practices

### When to Create Changesets

Create a changeset when:
- ✅ Adding new features
- ✅ Fixing bugs
- ✅ Making breaking changes
- ✅ Updating public APIs
- ✅ Changes affect package consumers

Don't create changesets for:
- ❌ Internal refactoring (no behavior change)
- ❌ Documentation-only updates
- ❌ Test updates without code changes
- ❌ Development dependency updates
- ❌ CI/CD configuration changes

### Changeset Best Practices

1. **Be Descriptive**: Write clear, user-focused descriptions
   ```markdown
   ---
   '@sveltepress/theme-default': minor
   ---
   
   Add support for code block titles using ```js title="filename"
   ```

2. **Group Related Changes**: Include all affected packages in one changeset
   ```markdown
   ---
   '@sveltepress/vite': minor
   '@sveltepress/theme-default': minor
   ---
   
   Add plugin API for custom markdown processors
   ```

3. **Choose Correct Version Bump**:
   - **Major**: Breaking changes requiring user action
   - **Minor**: New features, backward compatible
   - **Patch**: Bug fixes, backward compatible

4. **Write for Users**: Focus on impact, not implementation
   - ❌ "Refactored transformMarkdown function"
   - ✅ "Fixed issue where special characters in headings broke anchor links"

### Multiple Changesets

You can have multiple changesets before publishing:
- Each describes a discrete change
- They accumulate until `changeset version` is run
- All are consumed together during versioning

## Common Scenarios

### Scenario 1: Bug Fix in Single Package

```bash
# 1. Fix the bug in code
# 2. Create changeset
pnpm changeset
# Select: @sveltepress/theme-default
# Type: patch
# Summary: "Fix sidebar not highlighting active page"

# 3. Commit changeset with your code
git add .
git commit -m "fix(theme-default): fix sidebar highlighting"
```

### Scenario 2: New Feature Across Multiple Packages

```bash
# 1. Implement feature
# 2. Create changeset
pnpm changeset
# Select: @sveltepress/vite, @sveltepress/theme-default
# Type: minor for both
# Summary: "Add support for custom syntax highlighting themes"

# 3. Commit
git commit -m "feat: add custom syntax highlighting support"
```

### Scenario 3: Breaking Change

```bash
# 1. Make breaking change
# 2. Create changeset
pnpm changeset
# Select: affected packages
# Type: major
# Summary: "BREAKING: Remove deprecated `oldAPI()` function. Use `newAPI()` instead."

# 3. Commit
git commit -m "feat!: remove deprecated API"
```

### Scenario 4: Preparing a Release

```bash
# 1. Ensure all changesets are created
pnpm changeset status

# 2. Version packages
pnpm changeset version

# 3. Review generated CHANGELOGs
# 4. Commit version changes
git add .
git commit -m "chore: version packages"

# 5. Run tests
pnpm test

# 6. Publish
pnpm release

# 7. Push tags and changes
git push --follow-tags
```

## GitHub Integration

Changesets work with GitHub to:
- Generate changelogs with PR links
- Create GitHub releases automatically
- Link to issues and PRs in changelogs

The `@changesets/changelog-github` plugin automatically formats changelogs with:
- Links to PRs that introduced changes
- Author attribution
- Issue references

## Checking Status

Before versioning or publishing:

```bash
# See which packages have changesets
pnpm changeset status

# Output shows:
# - Packages with pending changes
# - Types of changes (major/minor/patch)
# - Current vs. new version numbers
```

## Troubleshooting

### No changesets found
- Check `.changeset/` directory for `.md` files
- Create a changeset with `pnpm changeset`

### Version not updating
- Ensure changeset files have valid frontmatter
- Check package names match those in package.json
- Run `pnpm changeset version` after creating changesets

### Publish fails
- Verify NPM authentication
- Check package.json has correct `name` and `version`
- Ensure packages are set to `"access": "public"` (in config)

## Tips for Claude

When helping with releases:

1. **Check for pending changesets**: Look in `.changeset/` directory
2. **Validate changeset format**: Ensure frontmatter and descriptions are correct
3. **Review version bumps**: Confirm major/minor/patch is appropriate
4. **Test before publishing**: Always run tests after versioning
5. **Verify changelogs**: Check generated CHANGELOG.md files are accurate
6. **Commit properly**: Version changes and changesets in separate commits

## Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Changesets CLI Reference](https://github.com/changesets/changesets/blob/main/docs/command-line-options.md)
- [Common Questions](https://github.com/changesets/changesets/blob/main/docs/common-questions.md)
- [Project's CONTRIBUTING.md](../../../CONTRIBUTING.md)
