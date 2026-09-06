import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { renderInTestApp, TestApiRegistry } from '@backstage/test-utils';
import { ApiProvider } from '@backstage/core-app-api';
import { configApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { RadarPage } from './RadarPage';
import { radarApiRef, RadarApi } from '../../api/RadarApi';

// ChartPreview renders a chart.js <canvas>, which jsdom cannot measure
// (it throws on `ownerDocument` during resize). The page-level tests below
// only care about the surrounding form/layout, so stub it out.
jest.mock('./ChartPreview', () => ({
  ChartPreview: () => null,
}));

describe('RadarPage', () => {
  const mockRadarApi: RadarApi = {
    generatePng: jest.fn(),
    saveChart: jest.fn(),
    getChart: jest.fn(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockConfigApi: any = {
    getOptionalString: jest.fn((key: string) =>
      key === 'radarChart.baseUrl' ? 'https://example.test' : undefined,
    ),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockIdentityApi: any = {
    getProfileInfo: jest.fn().mockResolvedValue({ displayName: 'Test User' }),
  };

  const renderPage = () => {
    const apis = TestApiRegistry.from(
      [radarApiRef, mockRadarApi],
      [configApiRef, mockConfigApi],
      [identityApiRef, mockIdentityApi],
    );
    return renderInTestApp(
      <ApiProvider apis={apis}>
        <RadarPage />
      </ApiProvider>,
    );
  };

  it('renders without crashing', async () => {
    await renderPage();
    expect(screen.getByText('Radar Chart Generator')).toBeInTheDocument();
  });

  it('renders configuration form', async () => {
    await renderPage();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Project Radar')).toBeInTheDocument();
  });

  it('renders generate button', async () => {
    await renderPage();
    expect(screen.getByText('Generate PNG & Save')).toBeInTheDocument();
  });
});
