# @andreacarmisciano/plugin-radar-chart

A frontend-only Backstage plugin that integrates KPI radar charts powered by a remote Cloud Run instance. Generate professional radar charts from any Backstage instance without a backend plugin — the plugin communicates directly with the stupid-radar-chart Cloud Run service.

## Architecture

- **Frontend-only**: No backend plugin needed
- **Remote API**: Calls `https://stupid-radar-chart-873837240388.us-central1.run.app`
- **Two modes**:
  - **EntityRadarChartCard**: Annotation-driven, read-only card that appears on annotated Backstage entities
  - **RadarPage**: Full configuration UI for generating and saving new charts

## Prerequisites: CORS

The Cloud Run instance must allow CORS requests from your Backstage origin. Add the following CORS header to the Cloud Run app's API responses:

```
Access-Control-Allow-Origin: https://your-backstage-origin.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

See [stupid-radar-chart](https://github.com/andreacarmisciano/stupid-radar-chart) for CORS configuration details.

## Installation

```bash
yarn add @andreacarmisciano/plugin-radar-chart
```

## Usage: New Frontend System

### Register the plugin in `app-config.yaml`

```yaml
features:
  - radarChartPlugin
```

### Mount in your frontend app

```typescript
// packages/app/src/App.tsx
import { radarChartPlugin } from '@andreacarmisciano/plugin-radar-chart';

const app = createApp({
  features: [
    // ... other plugins
    radarChartPlugin,
  ],
  // ... other config
});
```

### Use EntityRadarChartCard on entity pages

The card is automatically registered and will appear on `kind:component` entities that have the `radar-chart/kpis` annotation.

## Usage: Legacy Classic API

If your Backstage instance still uses the classic frontend system:

```typescript
// packages/app/src/App.tsx
import { radarChartPlugin, EntityRadarChartCard } from '@andreacarmisciano/plugin-radar-chart';

// Register the plugin
const app = createApp({
  plugins: [radarChartPlugin],
});

// Add route (if not using sidebar routing)
export default app.build().createRoot(
  <>
    <Root>
      <Routes>
        <Route path="/radar" element={<RadarPage />} />
        {/* ... */}
      </Routes>
    </Root>
  </>
);
```

Add the EntityRadarChartCard to entity pages:

```typescript
// In EntityLayout
<EntityLayout>
  <EntityLayout.Route if={isComponentEntity} path="/">
    <EntityRadarChartCard />
  </EntityLayout.Route>
</EntityLayout>
```

## Configuration

### Override base URL in `app-config.yaml`

By default, the plugin connects to the public Cloud Run instance. To use a different instance:

```yaml
radarChart:
  baseUrl: 'https://your-custom-radar-instance.com'
```

## Annotations: EntityRadarChartCard

The EntityRadarChartCard appears on component entities when the `radar-chart/kpis` annotation is present.

### Required annotation: `radar-chart/kpis`

JSON object with KPI values (1-100). Unknown keys are preserved for forward compatibility. Locked KPI names (`author`, `ai`, `team`, `research`, `unspecified`) default to 50 if omitted.

### Optional annotations

- `radar-chart/title` — Custom card title (defaults to entity name)
- `radar-chart/show-author` — `"true"` (default) or `"false"` to hide author name in chart title

### Example `catalog-info.yaml`

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  namespace: default
  annotations:
    radar-chart/kpis: |
      {
        "author": 85,
        "ai": 40,
        "team": 90,
        "research": 60,
        "unspecified": 50,
        "customKpi": 75
      }
    radar-chart/title: "My Service KPIs"
    radar-chart/show-author: "true"
spec:
  type: service
  lifecycle: production
  owner: team-a
```

## RadarPage: Configuration UI

Navigate to `/radar` to access the full configuration interface. The page offers:

- **Configuration form**: Edit title, author, deliverable type, locked KPIs, and add custom KPIs
- **Live chart preview**: See changes in real-time
- **Generate & Save**: Generate a PNG and save to the cloud (returns shareable URL)
- **Share box**: Copy shareable URL after saving

## License

MIT — Copyright 2026 Andrea Carmisciano
