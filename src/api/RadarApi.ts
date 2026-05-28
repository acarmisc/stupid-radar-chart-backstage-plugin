import { createApiRef } from '@backstage/core-plugin-api';
import { GenerateRequest, SavedChart, ChartConfig } from './types';

export interface RadarApi {
  generatePng(req: GenerateRequest): Promise<Blob>;
  saveChart(config: ChartConfig): Promise<{ slug: string; url: string }>;
  getChart(slug: string): Promise<SavedChart>;
}

export const radarApiRef = createApiRef<RadarApi>({
  id: 'plugin.radar-chart.service',
});
