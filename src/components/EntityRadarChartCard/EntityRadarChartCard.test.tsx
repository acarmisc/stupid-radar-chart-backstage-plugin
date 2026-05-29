import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp } from '@backstage/test-utils';
import { EntityRadarChartCard } from './EntityRadarChartCard';

const KPI_URL = 'https://example.test/kpis.json';

const createEntity = (annotations: Record<string, string> = {}): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component',
    namespace: 'default',
    annotations,
  },
});

const renderCard = (entity: Entity) =>
  renderInTestApp(
    <EntityProvider entity={entity}>
      <EntityRadarChartCard />
    </EntityProvider>,
  );

const mockFetchOk = (payload: unknown) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => payload,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
};

const mockFetchError = (status: number, statusText: string) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
    json: async () => ({}),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
};

describe('EntityRadarChartCard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null when kpi-url annotation is missing', async () => {
    const { container } = await renderCard(createEntity());
    expect(container.firstChild).toBeNull();
  });

  it('renders error panel when annotation URL is invalid', async () => {
    const entity = createEntity({ 'stupid-radar-chart/kpi-url': 'not a url' });
    await renderCard(entity);
    expect(screen.getAllByText(/valid absolute URL/).length).toBeGreaterThan(0);
  });

  it('renders chart card with entity name as title after successful fetch', async () => {
    mockFetchOk({ author: 80, ai: 40, team: 90, research: 55, unspecified: 30 });
    await renderCard(
      createEntity({ 'stupid-radar-chart/kpi-url': KPI_URL }),
    );
    await waitFor(() => expect(screen.getByText('test-component')).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith(KPI_URL);
  });

  it('uses custom title annotation when provided', async () => {
    mockFetchOk({ author: 80 });
    await renderCard(
      createEntity({
        'stupid-radar-chart/kpi-url': KPI_URL,
        'stupid-radar-chart/title': 'Custom Title',
      }),
    );
    await waitFor(() => expect(screen.getByText('Custom Title')).toBeInTheDocument());
  });

  it('renders error panel on fetch failure', async () => {
    mockFetchError(500, 'Internal Server Error');
    await renderCard(createEntity({ 'stupid-radar-chart/kpi-url': KPI_URL }));
    await waitFor(() =>
      expect(screen.getAllByText(/Failed to fetch KPIs/).length).toBeGreaterThan(0),
    );
  });

  it('renders error panel when payload contains invalid KPI value', async () => {
    mockFetchOk({ author: 150 });
    await renderCard(createEntity({ 'stupid-radar-chart/kpi-url': KPI_URL }));
    await waitFor(() =>
      expect(screen.getAllByText(/invalid value/).length).toBeGreaterThan(0),
    );
  });
});
