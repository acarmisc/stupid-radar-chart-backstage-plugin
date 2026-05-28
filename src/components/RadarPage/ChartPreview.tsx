import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Title,
  ChartDataset,
  ChartOptions,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Box } from '@material-ui/core';

ChartJS.register(RadialLinearScale, LineElement, PointElement, Filler, Tooltip, Title);

export interface ChartPreviewProps {
  title: string;
  author: string;
  showAuthor: boolean;
  lockedValues: Record<string, number>;
  extraKpi: { name: string; value: number } | null;
}

const LOCKED_KPI_NAMES = ['author', 'ai', 'team', 'research', 'unspecified'];

export const ChartPreview: React.FC<ChartPreviewProps> = ({
  title,
  author,
  showAuthor,
  lockedValues,
  extraKpi,
}) => {
  const labels = useMemo(() => {
    const locked = LOCKED_KPI_NAMES.map(k => k.charAt(0).toUpperCase() + k.slice(1));
    const extra = extraKpi ? [extraKpi.name.charAt(0).toUpperCase() + extraKpi.name.slice(1)] : [];
    return [...locked, ...extra];
  }, [extraKpi]);

  const values = useMemo(() => {
    const locked = LOCKED_KPI_NAMES.map(name => lockedValues[name] ?? 50);
    const extra = extraKpi ? [extraKpi.value] : [];
    return [...locked, ...extra];
  }, [lockedValues, extraKpi]);

  const data = useMemo(
    () => ({
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
          pointRadius: 5,
        } as ChartDataset<'radar', number[]>,
      ],
    }),
    [labels, values]
  );

  const options = useMemo(
    () =>
      ({
        maintainAspectRatio: false,
        elements: { line: { tension: 0.4 } },
        scales: {
          r: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            angleLines: { color: 'rgba(0, 0, 0, 0.05)' },
            pointLabels: {
              color: '#0d0d12',
              font: { size: 13, weight: 500 },
            },
            ticks: { display: false, backdropColor: 'transparent' },
          },
        },
        plugins: {
          legend: {
            labels: { color: '#0d0d12', font: { weight: 500 } },
          },
          title: {
            display: true,
            text: showAuthor ? `${title}\nby ${author}` : title,
            color: '#0d0d12',
            font: { size: 16, weight: 700 },
          },
        },
      } as ChartOptions<'radar'>),
    [title, author, showAuthor]
  );

  return (
    <Box style={{ height: 350, width: '100%' }}>
      <Radar data={data} options={options} />
    </Box>
  );
};
