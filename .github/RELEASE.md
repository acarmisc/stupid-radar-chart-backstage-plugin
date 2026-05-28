# Release & Publish

This document describes how to cut a release and publish `@andreacarmisciano/plugin-radar-chart` to npm.

## Prerequisites

Ensure you have:
- Node 20+ installed
- Commit access to this repository
- GitHub repository admin access (to set secrets)
- npm account with publish token for the `@andreacarmisciano` scope

## Setup (one-time)

### 1. Generate npm automation token

1. Go to https://www.npmjs.com/settings/andreacarmisciano/tokens
2. Click **"Generate new token"** → **Granular Access Token**
3. Set permissions:
   - **Scope**: `@andreacarmisciano` 
   - **Permissions**: Read and write on packages
   - **Expiration**: 1 year (or your preference)
4. Copy the token (shown once)

### 2. Add `NPM_TOKEN` secret to GitHub

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Name: `NPM_TOKEN`
4. Value: Paste the token from step 1
5. Click **"Add secret"**

## Cutting a release

Follow these steps to publish a new version:

### 1. Update version in package.json

Use `npm version` to bump the version and create a git tag:

```bash
npm version patch    # For bug fixes (0.1.0 → 0.1.1)
npm version minor    # For new features (0.1.0 → 0.2.0)
npm version major    # For breaking changes (0.1.0 → 1.0.0)
```

This will:
- Bump the version in `package.json`
- Create a commit with the version bump
- Create a git tag `vX.Y.Z`

### 2. Push tag to GitHub

```bash
git push origin main
git push origin vX.Y.Z
```

Or, push both in one command:

```bash
git push --follow-tags
```

The tag push will **automatically**:
- Trigger the `.github/workflows/release.yml` workflow
- Run lint, test, and build
- Verify the tag version matches `package.json` version
- Publish to npm with provenance
- Create a GitHub Release with auto-generated release notes

### 3. Verify the publish

Check that the package is available on npm:

```bash
npm view @andreacarmisciano/plugin-radar-chart
```

You should see the latest version listed, along with publication timestamp.

## Troubleshooting

### Workflow failed

1. Check the GitHub Actions workflow logs in the **Actions** tab
2. Common issues:
   - `NPM_TOKEN` secret not set or expired → regenerate at npmjs.com
   - Tag version doesn't match `package.json` version → tag must be `v` + exact version string
   - Lint/test/build failures → fix code and retry with a new tag

### Version mismatch error

If you see:
```
ERROR: Tag version (0.1.0) does not match package.json version (0.1.1)
```

This means the git tag doesn't match the `package.json` version. Use `npm version` (step 1 above) to keep them in sync.

## Rollback

If you need to unpublish or deprecate a version:

### Deprecate (recommended)

```bash
npm deprecate @andreacarmisciano/plugin-radar-chart@X.Y.Z "reason"
```

Example:
```bash
npm deprecate @andreacarmisciano/plugin-radar-chart@0.1.0 "Security issue — use 0.1.1 instead"
```

This marks the version as deprecated on npm without removing it (unpublish is not allowed after 72 hours).

### Unpublish (within 72 hours only)

```bash
npm unpublish @andreacarmisciano/plugin-radar-chart@X.Y.Z
```

## Workflow specification

For details on the automated pipeline, see `.github/workflows/release.yml`. It:

1. **Triggers** on push of tags matching `v*.*.*` (semver only)
2. **Rejects** pre-releases (e.g., `v0.1.0-beta.1`) — only major.minor.patch
3. **Validates** the tag version matches `package.json` version before publishing
4. **Publishes** with provenance (supply chain transparency)
5. **Creates** a GitHub Release with auto-generated changelog

## Continuous Integration

Pull requests and pushes to `main` automatically run lint, test, and build via `.github/workflows/ci.yml`. Ensure all checks pass before releasing.
