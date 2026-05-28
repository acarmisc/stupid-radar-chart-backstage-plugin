// Main plugin export (classic API)
export { radarChartPlugin, RadarPage, EntityRadarChartCard } from './plugin';

// Alternative export for direct usage
export { radarChartPlugin as plugin } from './plugin';

// Public API exports
export { radarApiRef } from './api/RadarApi';
export type { RadarApi } from './api/RadarApi';
export type { ChartConfig, GenerateRequest, SavedChart } from './api/types';

// Components for new frontend system (import explicitly)
export { RadarPage as RadarPageComponent } from './components/RadarPage';
export { EntityRadarChartCard as EntityRadarChartCardComponent } from './components/EntityRadarChartCard';
