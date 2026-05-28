import { ConfigApi } from '@backstage/core-plugin-api';

const DEFAULT_BASE_URL = 'https://stupid-radar-chart-873837240388.us-central1.run.app';

export function getBaseUrl(config: ConfigApi): string {
  return config.getOptionalString('radarChart.baseUrl') ?? DEFAULT_BASE_URL;
}
