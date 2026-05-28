import React, { useState, useCallback } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { Page, Header, Content } from '@backstage/core-components';
import { Box, Button, Grid, CircularProgress } from '@material-ui/core';
import { radarApiRef } from '../../api/RadarApi';
import { ChartConfig } from '../../api/types';
import { getBaseUrl } from '../../config';
import { ConfigForm } from './ConfigForm';
import { ChartPreview } from './ChartPreview';
import { ShareBox } from './ShareBox';

const DEFAULT_CONFIG: ChartConfig = {
  title: 'Project Radar',
  author: 'Team',
  deliverableType: 'other',
  showAuthor: true,
  extraKpi: null,
  lockedValues: {
    author: 50,
    ai: 50,
    team: 50,
    research: 50,
    unspecified: 50,
  },
};

export const RadarPage: React.FC = () => {
  const radarApi = useApi(radarApiRef);
  const configApi = useApi(configApiRef);
  const baseUrl = getBaseUrl(configApi);

  const [config, setConfig] = useState<ChartConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  const handleReset = useCallback(() => {
    setConfig({ ...DEFAULT_CONFIG });
  }, []);

  const handleGenerateAndSave = useCallback(async () => {
    setSaving(true);
    try {
      const result = await radarApi.saveChart(config);
      setSlug(result.slug);

      // Trigger PNG download
      const kpis: Record<string, number> = { ...config.lockedValues };
      if (config.extraKpi) {
        kpis[config.extraKpi.name] = config.extraKpi.value;
      }

      const blob = await radarApi.generatePng({
        title: config.title,
        author: config.author,
        deliverableType: config.deliverableType,
        kpis,
        showAuthor: config.showAuthor,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `radar-${config.author.replace(/\s+/g, '_')}-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Failed to generate and save chart: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  }, [config, radarApi]);

  return (
    <Page themeId="tool">
      <Header title="Radar Chart Generator" subtitle="Create KPI radar charts from your data" />
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ConfigForm config={config} onChange={setConfig} onReset={handleReset} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              style={{
                padding: 24,
                border: '1px solid #e0e0e0',
                borderRadius: 4,
                backgroundColor: '#fafafa',
              }}
            >
              <ChartPreview
                title={config.title}
                author={config.author}
                showAuthor={config.showAuthor}
                lockedValues={config.lockedValues}
                extraKpi={config.extraKpi}
              />
            </Box>

            <Box marginTop={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleGenerateAndSave}
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : 'Generate PNG & Save'}
              </Button>
            </Box>

            {slug && <ShareBox slug={slug} baseUrl={baseUrl} />}
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
