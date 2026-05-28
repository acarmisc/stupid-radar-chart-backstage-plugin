// Re-export components and plugin for new frontend system
// The actual plugin implementation is in plugin.ts (classic API)
// Apps using the new frontend system should import the plugin from index.ts
// and register it in their extensions

export { RadarPage } from './components/RadarPage';
export { EntityRadarChartCard } from './components/EntityRadarChartCard';
