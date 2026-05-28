import { createDevApp } from '@backstage/dev-utils';
import { radarChartPlugin, RadarPage } from '../src/index';

const devApp = createDevApp()
  .registerPlugin(radarChartPlugin)
  .addPage({
    element: <RadarPage />,
    title: 'Radar Chart',
    path: '/radar',
  });

export default devApp.render();
