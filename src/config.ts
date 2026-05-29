import { ConfigApi } from '@backstage/core-plugin-api';

export function getBaseUrl(config: ConfigApi): string {
  const baseUrl = config.getOptionalString('radarChart.baseUrl');
  if (!baseUrl) {
    throw new Error(
      'radarChart.baseUrl is not configured. Set it in app-config.yaml under `radarChart.baseUrl`.',
    );
  }
  return baseUrl.replace(/\/+$/, '');
}
