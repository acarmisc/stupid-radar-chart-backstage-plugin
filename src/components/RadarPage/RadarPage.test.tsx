import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestApiProvider } from '@backstage/test-utils';
import { configApiRef } from '@backstage/core-plugin-api';
import { RadarPage } from './RadarPage';
import { radarApiRef } from '../../api/RadarApi';
import { RadarApi } from '../../api/RadarApi';

describe('RadarPage', () => {
  const mockRadarApi: RadarApi = {
    generatePng: jest.fn(),
    saveChart: jest.fn(),
    getChart: jest.fn(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockConfigApi: any = {
    getOptionalString: jest.fn(() => undefined),
  };

  const renderPage = () => {
    return render(
      <TestApiProvider
        apis={[
          [radarApiRef, mockRadarApi],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [configApiRef, mockConfigApi as any],
        ]}
      >
        <RadarPage />
      </TestApiProvider>
    );
  };

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText('Radar Chart Generator')).toBeInTheDocument();
  });

  it('renders configuration form', () => {
    renderPage();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Title/)).toBeInTheDocument();
  });

  it('renders generate button', () => {
    renderPage();
    expect(screen.getByText('Generate PNG & Save')).toBeInTheDocument();
  });
});
