import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { ResponseErrorPanel, InfoCard } from '@backstage/core-components';
import {
  Chart as ChartJS,
  RadialLinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { parseRadarAnnotations, AnnotationParseError, entityHasRadarChartAnnotation } from './annotations';

ChartJS.register(RadialLinearScale, LineElement, PointElement, Filler, Tooltip);

export const EntityRadarChartCard: React.FC = () => {
  const { entity } = useEntity();

  // Filter: only render if annotation is present
  if (!entityHasRadarChartAnnotation(entity)) {
    return null;
  }

  let data: { kpis: Record<string, number>; title?: string; showAuthor: boolean };
  try {
    const result = parseRadarAnnotations(entity);
    if (!result) {
      return null;
    }
    data = result;
  } catch (e) {
    const errorMessage = e instanceof AnnotationParseError ? e.message : String(e);
    return (
      <InfoCard title="Radar Chart">
        <ResponseErrorPanel error={new Error(errorMessage)} />
      </InfoCard>
    );
  }

  // Sort KPI names for consistent label ordering
  const labels = Object.keys(data.kpis)
    .sort()
    .map(k => k.charAt(0).toUpperCase() + k.slice(1));

  const values = labels.map(label => data.kpis[label.toLowerCase()]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'KPI Values',
        data: values,
        backgroundColor: 'rgba(15, 98, 254, 0.2)',
        borderColor: '#0F62FE',
        borderWidth: 2,
        pointBackgroundColor: '#6b46ff',
        pointBorderColor: '#0F62FE',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: true,
    responsive: true,
    elements: { line: { tension: 0.4 } },
    scales: {
      r: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        angleLines: { color: 'rgba(0, 0, 0, 0.05)' },
        pointLabels: {
          color: '#0d0d12',
          font: { size: 11, weight: 500 },
        },
        ticks: { display: false, backdropColor: 'transparent' },
      },
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (context: any) => `${context.label}: ${context.parsed.r}`,
        },
      },
    },
  };

  const cardTitle = data.title || entity.metadata.name || 'Radar Chart';

  return (
    <InfoCard title={cardTitle}>
      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Radar data={chartData} options={chartOptions} />
      </div>
    </InfoCard>
  );
};
