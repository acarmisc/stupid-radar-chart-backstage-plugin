import React from 'react';
import { useAsync } from 'react-use';
import { useEntity } from '@backstage/plugin-catalog-react';
import { ResponseErrorPanel, InfoCard, Progress } from '@backstage/core-components';
import {
  Chart as ChartJS,
  RadialLinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import {
  parseRadarAnnotations,
  validateKpisPayload,
  AnnotationParseError,
  entityHasRadarChartAnnotation,
} from './annotations';

ChartJS.register(RadialLinearScale, LineElement, PointElement, Filler, Tooltip);

export const EntityRadarChartCard: React.FC = () => {
  const { entity } = useEntity();

  if (!entityHasRadarChartAnnotation(entity)) {
    return null;
  }

  let annotation;
  try {
    annotation = parseRadarAnnotations(entity);
  } catch (e) {
    const message = e instanceof AnnotationParseError ? e.message : String(e);
    return (
      <InfoCard title="Radar Chart">
        <ResponseErrorPanel error={new Error(message)} />
      </InfoCard>
    );
  }

  if (!annotation) {
    return null;
  }

  const cardTitle = annotation.title || entity.metadata.name || 'Radar Chart';

  return <KpiChart kpiUrl={annotation.kpiUrl} title={cardTitle} />;
};

const KpiChart: React.FC<{ kpiUrl: string; title: string }> = ({ kpiUrl, title }) => {
  const { loading, error, value: kpis } = useAsync(async () => {
    const response = await fetch(kpiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch KPIs (${response.status} ${response.statusText})`);
    }
    const payload = await response.json();
    return validateKpisPayload(payload);
  }, [kpiUrl]);

  if (loading) {
    return (
      <InfoCard title={title}>
        <Progress />
      </InfoCard>
    );
  }

  if (error || !kpis) {
    return (
      <InfoCard title={title}>
        <ResponseErrorPanel error={error ?? new Error('Empty KPI payload')} />
      </InfoCard>
    );
  }

  const labels = Object.keys(kpis)
    .sort()
    .map(k => k.charAt(0).toUpperCase() + k.slice(1));
  const values = labels.map(label => kpis[label.toLowerCase()]);

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

  return (
    <InfoCard title={title}>
      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Radar data={chartData} options={chartOptions} />
      </div>
    </InfoCard>
  );
};
