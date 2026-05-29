# @ehicoso/plugin-radar-chart

Frontend-only Backstage plugin that embeds KPI radar charts produced by a remote chart-rendering service. The plugin issues HTTP calls directly from the browser to a service base URL you provide — no Backstage backend plugin required.

## Architecture

- **Frontend-only.** Ships as a `frontend-plugin`; nothing runs server-side.
- **Remote API.** All chart generation, persistence, and retrieval go to the URL set in `radarChart.baseUrl`.
- **Two surfaces:**
  - `EntityRadarChartCard` — annotation-driven, read-only card on Component entities.
  - `RadarPage` — full configuration UI to build and persist new charts.

## Prerequisites

### Configure the service base URL

The plugin will throw at runtime if `radarChart.baseUrl` is not set. Add it to your `app-config.yaml`:

```yaml
radarChart:
  baseUrl: 'https://<your-radar-chart-service>'
```

### CORS

The upstream service must allow CORS requests from your Backstage origin:

```
Access-Control-Allow-Origin: https://<your-backstage-origin>
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Installation

```bash
yarn add @ehicoso/plugin-radar-chart
```

## Usage (new frontend system)

```typescript
// packages/app/src/App.tsx
import radarChartPlugin from '@ehicoso/plugin-radar-chart';

const app = createApp({
  features: [
    // ...
    radarChartPlugin,
  ],
});
```

`EntityRadarChartCard` is registered with the plugin and renders on `kind:Component` entities that carry the `radar-chart/kpis` annotation. Entities without the annotation render nothing.

## Usage (legacy classic API)

```typescript
import {
  radarChartPlugin,
  RadarPage,
  EntityRadarChartCard,
} from '@ehicoso/plugin-radar-chart';

// Register the plugin
const app = createApp({ plugins: [radarChartPlugin] });

// Route
<Route path="/radar" element={<RadarPage />} />

// Entity card
<EntityLayout.Route path="/" title="Overview">
  <EntityRadarChartCard />
</EntityLayout.Route>
```

## Annotations: `EntityRadarChartCard`

### Required: `stupid-radar-chart/kpi-url`

Absolute URL that returns a JSON object mapping KPI name → integer in `[1, 100]`. The card fetches this URL on render, so KPI values can change without editing `catalog-info.yaml`.

The endpoint must:

- respond with `Content-Type: application/json`,
- return a JSON object (not an array),
- allow CORS requests from the Backstage origin (`Access-Control-Allow-Origin`).

Unknown KPI keys are preserved (forward-compatible). The locked KPI names (`author`, `ai`, `team`, `research`, `unspecified`) default to `50` when omitted from the payload.

### Optional

- `stupid-radar-chart/title` — overrides the card title (defaults to entity name).
- `stupid-radar-chart/show-author` — `"true"` (default) or `"false"`.

### Example `catalog-info.yaml`

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    stupid-radar-chart/kpi-url: 'https://kpis.example.test/my-service.json'
    stupid-radar-chart/title: 'My Service KPIs'
    stupid-radar-chart/show-author: 'true'
spec:
  type: service
  lifecycle: production
  owner: team-a
```

### Expected payload shape

```json
{
  "author": 85,
  "ai": 40,
  "team": 90,
  "research": 60,
  "unspecified": 50,
  "customKpi": 75
}
```

Behavior:

- annotation missing → card not rendered,
- URL not parseable, fetch fails, or payload invalid → `ResponseErrorPanel` rendered inside the card,
- request in flight → `Progress` indicator inside the card.

## `RadarPage`

Mount on a route (`/radar` by convention) to expose:

- a configuration form (title, author, deliverable type, locked KPIs, optional custom KPI),
- a live preview rendered with `react-chartjs-2`,
- a "Generate PNG & Save" action that persists the chart on the remote service, downloads the PNG, and exposes a shareable URL.

## Configuration reference

| Key                  | Type   | Required | Description                                  |
| -------------------- | ------ | -------- | -------------------------------------------- |
| `radarChart.baseUrl` | string | yes      | Base URL of the remote chart-rendering service. |

## Release / CI

- `.github/workflows/ci.yml` — lint + test + build on push and PR to `main`.
- `.github/workflows/release.yml` — publishes to npm and creates a GitHub release on tags matching `v*.*.*`. Requires the `NPM_TOKEN` repository secret (npm automation token with publish access to the `@ehicoso` scope).

## License

MIT
