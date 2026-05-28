import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import { EntityRadarChartCard } from './EntityRadarChartCard';

describe('EntityRadarChartCard', () => {
  const createEntity = (annotations: Record<string, string> = {}): Entity => ({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'test-component',
      namespace: 'default',
      annotations,
    },
  });

  const renderCard = (entity: Entity) => {
    return render(
      <TestApiProvider apis={[]}>
        <EntityProvider entity={entity}>
          <EntityRadarChartCard />
        </EntityProvider>
      </TestApiProvider>
    );
  };

  it('returns null when annotation is missing', () => {
    const entity = createEntity();
    const { container } = renderCard(entity);
    expect(container.firstChild).toBeNull();
  });

  it('renders card with radar chart when annotation is present', () => {
    const entity = createEntity({
      'radar-chart/kpis': '{"author":80,"ai":40,"team":90,"research":55,"unspecified":30}',
    });
    renderCard(entity);
    // The InfoCard renders with the entity name
    expect(screen.getByText('test-component')).toBeInTheDocument();
  });

  it('renders card with custom title annotation', () => {
    const entity = createEntity({
      'radar-chart/kpis': '{"author":80}',
      'radar-chart/title': 'Custom Title',
    });
    renderCard(entity);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders error panel on malformed JSON', () => {
    const entity = createEntity({
      'radar-chart/kpis': 'not json',
    });
    renderCard(entity);
    // ResponseErrorPanel should render
    expect(screen.getByText(/Failed to parse/)).toBeInTheDocument();
  });

  it('renders error panel on invalid KPI value', () => {
    const entity = createEntity({
      'radar-chart/kpis': '{"author":150}',
    });
    renderCard(entity);
    expect(screen.getByText(/invalid value/)).toBeInTheDocument();
  });
});
