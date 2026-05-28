import {
  createPlugin,
  createRoutableExtension,
  createApiFactory,
  configApiRef,
} from '@backstage/core-plugin-api';
import { radarApiRef } from './api/RadarApi';
import { RadarApiClient } from './api/RadarApiClient';
import { rootRouteRef } from './routes';

export const radarChartPlugin = createPlugin({
  id: 'radar-chart',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: radarApiRef,
      deps: { configApi: configApiRef },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      factory: ({ configApi }: any) => new RadarApiClient(configApi),
    }),
  ],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RadarPage = radarChartPlugin.provide(
  createRoutableExtension({
    name: 'RadarPage',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: () => import('./components/RadarPage').then(m => m.RadarPage) as any,
    mountPoint: rootRouteRef,
  })
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EntityRadarChartCard = radarChartPlugin.provide(
  createRoutableExtension({
    name: 'EntityRadarChartCard',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: () => import('./components/EntityRadarChartCard').then(m => m.EntityRadarChartCard) as any,
    mountPoint: rootRouteRef,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any
);
