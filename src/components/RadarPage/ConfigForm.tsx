import React, { useCallback } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  Select,
  Slider,
  Switch,
  TextField,
  Typography,
  Paper,
} from '@material-ui/core';
import { ChartConfig } from '../../api/types';

const LOCKED_KPI_NAMES = ['author', 'ai', 'team', 'research', 'unspecified'];

export interface ConfigFormProps {
  config: ChartConfig;
  onChange: (config: ChartConfig) => void;
  onReset: () => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ config, onChange, onReset }) => {
  const handleFieldChange = useCallback(
    <K extends keyof ChartConfig>(key: K, value: ChartConfig[K]) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange]
  );

  const handleLockedKpiChange = useCallback(
    (name: string, value: number) => {
      onChange({
        ...config,
        lockedValues: { ...config.lockedValues, [name]: value },
      });
    },
    [config, onChange]
  );

  const handleExtraKpiNameChange = useCallback(
    (name: string) => {
      if (config.extraKpi) {
        onChange({
          ...config,
          extraKpi: { ...config.extraKpi, name },
        });
      }
    },
    [config, onChange]
  );

  const handleExtraKpiValueChange = useCallback(
    (value: number) => {
      if (config.extraKpi) {
        onChange({
          ...config,
          extraKpi: { ...config.extraKpi, value },
        });
      }
    },
    [config, onChange]
  );

  const addExtraKpi = useCallback(() => {
    onChange({ ...config, extraKpi: { name: 'custom', value: 50 } });
  }, [config, onChange]);

  const removeExtraKpi = useCallback(() => {
    onChange({ ...config, extraKpi: null });
  }, [config, onChange]);

  return (
    <Paper style={{ padding: 24 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
        <Typography variant="h6">Configuration</Typography>
        <Button onClick={onReset} size="small">
          Reset
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Project Title"
            value={config.title}
            onChange={e => handleFieldChange('title', e.target.value)}
            variant="outlined"
            size="small"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Author"
            value={config.author}
            onChange={e => handleFieldChange('author', e.target.value)}
            variant="outlined"
            size="small"
          />
        </Grid>

        <Grid item xs={12}>
          <Select
            native
            fullWidth
            value={config.deliverableType}
            onChange={e => handleFieldChange('deliverableType', e.target.value as string)}
          >
            <option value="slideshow">Slide Deck</option>
            <option value="code">Code</option>
            <option value="workbook">Workbook</option>
            <option value="other">Other</option>
          </Select>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={config.showAuthor}
                onChange={e => handleFieldChange('showAuthor', e.target.checked)}
              />
            }
            label="Show author name"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            KPIs ({LOCKED_KPI_NAMES.length + (config.extraKpi ? 1 : 0)})
          </Typography>

          {LOCKED_KPI_NAMES.map(name => (
            <Box key={name} marginBottom={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={1}>
                <Typography variant="body2" style={{ textTransform: 'capitalize' }}>
                  {name}
                </Typography>
                <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                  {config.lockedValues[name] ?? 50}
                </Typography>
              </Box>
              <Slider
                min={1}
                max={100}
                value={config.lockedValues[name] ?? 50}
                onChange={(_, value) => handleLockedKpiChange(name, value as number)}
                marks={[
                  { value: 1, label: '1' },
                  { value: 100, label: '100' },
                ]}
              />
            </Box>
          ))}

          {config.extraKpi && (
            <Box marginBottom={3} paddingTop={2} borderTop="1px dashed #ccc">
              <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={1}>
                <TextField
                  size="small"
                  value={config.extraKpi.name}
                  onChange={e => handleExtraKpiNameChange(e.target.value)}
                  variant="outlined"
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Typography variant="body2" style={{ fontWeight: 'bold', marginRight: 8 }}>
                  {config.extraKpi.value}
                </Typography>
                <Button onClick={removeExtraKpi} size="small" color="secondary">
                  Remove
                </Button>
              </Box>
              <Slider
                min={1}
                max={100}
                value={config.extraKpi.value}
                onChange={(_, value) => handleExtraKpiValueChange(value as number)}
                marks={[
                  { value: 1, label: '1' },
                  { value: 100, label: '100' },
                ]}
              />
            </Box>
          )}

          {!config.extraKpi && (
            <Box marginTop={2} display="flex">
              <Button variant="outlined" onClick={addExtraKpi} fullWidth>
                + Add Custom KPI
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};
