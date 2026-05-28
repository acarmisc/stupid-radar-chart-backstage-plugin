# Backstage Plugin Plan — `@andreacarmisciano/plugin-radar-chart`

Frontend-only Backstage plugin that talks to a remote Cloud Run instance of `stupid-radar-chart`. No backend plugin. Source-of-truth UI for KPI radar charts lives at Cloud Run; this plugin embeds it natively in Backstage.

## Decisions locked

- **Option E** — frontend-only, calls remote API
- **Mode 1** for EntityRadarChartCard — annotation-driven, read-only
- Remote base URL: `https://stupid-radar-chart-873837240388.us-central1.run.app`
- Backstage frontend system: **new** (`@backstage/frontend-plugin-api`) with classic export shim for back-compat where trivial
- Form rewritten in **MUI** (drop Tailwind in plugin)
- React 18 peer dep (Backstage native)
- Package name: `@andreacarmisciano/plugin-radar-chart` (scoped, public on npmjs)
- License: MIT

## Repo layout (target)

```
stupid-radar-chart-backstage-plugin/
├── PLAN.md                          (this file)
├── README.md                        (install + usage + annotations)
├── LICENSE                          (MIT)
├── package.json
├── tsconfig.json
├── .gitignore
├── .npmignore
├── .github/
│   └── workflows/
│       └── release.yml              (build + publish on tag v*)
├── src/
│   ├── index.ts                     (public exports)
│   ├── alpha.ts                     (new frontend system extensions)
│   ├── plugin.ts                    (legacy createPlugin export shim)
│   ├── routes.ts                    (RouteRef definitions)
│   ├── api/
│   │   ├── RadarApi.ts              (ApiRef + interface)
│   │   ├── RadarApiClient.ts        (fetch implementation)
│   │   └── types.ts                 (ChartConfig, SavedChart, GenerateRequest)
│   ├── config.ts                    (read radarChart.baseUrl from ConfigApi)
│   ├── components/
│   │   ├── RadarPage/
│   │   │   ├── RadarPage.tsx        (MUI shell + form + preview)
│   │   │   ├── ConfigForm.tsx       (MUI sliders/inputs)
│   │   │   ├── ChartPreview.tsx     (react-chartjs-2 Radar)
│   │   │   ├── ShareBox.tsx         (slug → copyable URL)
│   │   │   └── index.ts
│   │   └── EntityRadarChartCard/
│   │       ├── EntityRadarChartCard.tsx
│   │       ├── annotations.ts       (parse + filter helpers)
│   │       └── index.ts
│   └── translations.ts              (optional, en-only stub)
├── config.d.ts                      (configSchema for radarChart.baseUrl)
└── dev/
    └── index.tsx                    (standalone dev harness for `yarn start`)
```

## Public API (exports)

```ts
// new frontend system
export default radarChartPlugin;           // from alpha.ts
export { radarPage, entityRadarChartCard };

// legacy classic API (back-compat)
export { radarChartPlugin as plugin };
export { RadarPage, EntityRadarChartCard };
export { radarApiRef } from './api/RadarApi';
```

## Config schema

`config.d.ts`:
```ts
export interface Config {
  radarChart?: {
    /**
     * Base URL of the stupid-radar-chart Cloud Run instance.
     * @visibility frontend
     */
    baseUrl: string;
  };
}
```

Defaults to `https://stupid-radar-chart-873837240388.us-central1.run.app` if not set.

## Annotations contract (Mode 1)

```yaml
metadata:
  annotations:
    radar-chart/kpis: '{"author":80,"ai":40,"team":90,"research":55,"unspecified":30}'
    radar-chart/title: "Optional title override"      # optional
    radar-chart/show-author: "false"                  # optional, default true
```

Card filter: only renders when `radar-chart/kpis` annotation is present. No empty state on unannotated entities.

Validation rules in `annotations.ts`:
- JSON must parse
- Values must be numbers 1..100
- Unknown KPI keys allowed (forward-compat)
- If parse fails → render `<ResponseErrorPanel/>` with parse error
- All locked KPI keys (`author`, `ai`, `team`, `research`, `unspecified`) optional → default 50 when missing

## RadarApi surface

```ts
export interface RadarApi {
  generatePng(req: GenerateRequest): Promise<Blob>;
  saveChart(config: ChartConfig): Promise<{ slug: string; url: string }>;
  getChart(slug: string): Promise<SavedChart>;
}
```

Endpoints called:
- `POST {baseUrl}/api/generate-radar` → PNG blob
- `POST {baseUrl}/api/charts?out=url` → `{slug, url}`
- `GET {baseUrl}/api/charts/{slug}` → SavedChart

## Routes

- `/radar` — full RadarPage (sidebar item registered by host app)
- EntityRadarChartCard renders on `kind:component` entity pages when filter matches

## Dev harness

`dev/index.tsx` uses `@backstage/frontend-test-utils` (or `@backstage/dev-utils` for legacy) so contributors run `yarn start` to preview the page in isolation against the live Cloud Run instance.

## package.json key fields

```json
{
  "name": "@andreacarmisciano/plugin-radar-chart",
  "version": "0.1.0",
  "description": "Backstage frontend plugin for stupid-radar-chart — generate KPI radar charts from any Backstage instance.",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist/**/*", "config.d.ts", "README.md", "LICENSE"],
  "publishConfig": {
    "access": "public",
    "main": "dist/index.cjs.js",
    "module": "dist/index.esm.js",
    "types": "dist/index.d.ts"
  },
  "backstage": {
    "role": "frontend-plugin",
    "pluginId": "radar-chart"
  },
  "configSchema": "config.d.ts",
  "scripts": {
    "start": "backstage-cli package start",
    "build": "backstage-cli package build",
    "lint": "backstage-cli package lint",
    "test": "backstage-cli package test",
    "clean": "backstage-cli package clean",
    "prepack": "backstage-cli package prepack",
    "postpack": "backstage-cli package postpack"
  },
  "dependencies": {
    "@backstage/core-components": "^0.15.0",
    "@backstage/core-plugin-api": "^1.10.0",
    "@backstage/frontend-plugin-api": "^0.9.0",
    "@backstage/plugin-catalog-react": "^1.14.0",
    "@backstage/errors": "^1.2.0",
    "@material-ui/core": "^4.12.0",
    "@material-ui/icons": "^4.11.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "react-use": "^17.5.0"
  },
  "peerDependencies": {
    "react": "^17 || ^18",
    "react-dom": "^17 || ^18"
  },
  "devDependencies": {
    "@backstage/cli": "^0.28.0",
    "@backstage/core-app-api": "^1.15.0",
    "@backstage/dev-utils": "^1.1.0",
    "@backstage/test-utils": "^1.7.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@types/react": "^18.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

(Versions to be reconciled by `backstage-cli` once installed — agent should run `yarn install` and accept any minor adjustments.)

## CORS prerequisite (NOT in this plugin's scope)

Cloud Run app must add CORS headers on `/api/*` allowing Backstage origin. Tracked separately in the Next.js repo. Plugin README must document this requirement.

## GitHub Actions release pipeline

Workflow file: `.github/workflows/release.yml`

Trigger: `push` of tag matching `v*.*.*` (semver).

Steps:
1. Checkout
2. Setup Node 20, Yarn 4 (or npm 10 — see Agent 2 decision)
3. Install deps (frozen lockfile)
4. Lint
5. Test (CI mode)
6. Build (`backstage-cli package build`)
7. Verify package version matches tag (strip leading `v`, compare against `package.json` version — fail if mismatch)
8. Publish to npmjs with `NODE_AUTH_TOKEN` secret (`NPM_TOKEN`)
9. Create GitHub Release with auto-generated changelog

Secrets required (documented in README):
- `NPM_TOKEN` — npm automation token with publish scope on `@andreacarmisciano`

Optional: add a `pr-validation.yml` running lint + test + build on PRs (nice-to-have, agent decides if time permits).

## Quality bar

- TypeScript strict mode
- `backstage-cli package lint` passes clean
- At least: 1 unit test for `annotations.ts` parser, 1 render test for `EntityRadarChartCard` (annotated + unannotated cases), 1 render test for `RadarPage`
- README has: install snippet, app `App.tsx` registration snippet, `app-config.yaml` registration snippet (new system), annotation example for entity catalog YAML, CORS note

## Out of scope (v0.1.0)

- System-level aggregation card
- Mode 2 (slug-driven) — could add in 0.2
- Mode 3 (inline edit) — never
- i18n beyond English stubs
- Storybook
- Visual regression

## Implementation order (for Agent 1)

1. Scaffold package.json, tsconfig, .gitignore, .npmignore, LICENSE
2. `config.d.ts`
3. `api/types.ts`, `api/RadarApi.ts`, `api/RadarApiClient.ts`
4. `routes.ts`
5. `components/EntityRadarChartCard/annotations.ts` + unit test
6. `components/EntityRadarChartCard/EntityRadarChartCard.tsx` + render test
7. `components/RadarPage/*` (ConfigForm, ChartPreview, ShareBox, RadarPage) + smoke test
8. `alpha.ts` — `createFrontendPlugin`, `PageBlueprint`, `EntityCardBlueprint`, `ApiBlueprint`
9. `plugin.ts` — legacy classic shim (`createPlugin`, `createRoutableExtension`, `createApiFactory`)
10. `index.ts` — public exports
11. `dev/index.tsx` — dev harness
12. README.md
13. Run `yarn install && yarn lint && yarn test && yarn build` until green

## Implementation order (for Agent 2)

1. `.github/workflows/release.yml`
2. (Optional) `.github/workflows/pr-validation.yml`
3. Document required secrets in README (cross-link if Agent 1 already wrote README)
4. Add `version-check` step that fails if `package.json` version ≠ tag version (strip `v` prefix)

## Acceptance

- `npm install @andreacarmisciano/plugin-radar-chart` works after first tag
- Plugin renders on `/radar` route in a fresh Backstage app
- EntityRadarChartCard appears on annotated Component entities only
- Tagged release `v0.1.0` triggers workflow that publishes successfully
