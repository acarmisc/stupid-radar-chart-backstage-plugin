import { Entity } from '@backstage/catalog-model';

export const RADAR_CHART_KPI_URL_ANNOTATION = 'stupid-radar-chart/kpi-url';
export const RADAR_CHART_TITLE_ANNOTATION = 'stupid-radar-chart/title';
export const RADAR_CHART_SHOW_AUTHOR_ANNOTATION = 'stupid-radar-chart/show-author';

const LOCKED_KPI_NAMES = ['author', 'ai', 'team', 'research', 'unspecified'];
const DEFAULT_KPI_VALUE = 50;

export interface RadarAnnotationData {
  kpiUrl: string;
  title?: string;
  showAuthor: boolean;
}

export class AnnotationParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnnotationParseError';
  }
}

export function entityHasRadarChartAnnotation(entity: Entity): boolean {
  const annotations = entity.metadata.annotations || {};
  return RADAR_CHART_KPI_URL_ANNOTATION in annotations;
}

export function parseRadarAnnotations(entity: Entity): RadarAnnotationData | null {
  const annotations = entity.metadata.annotations || {};

  const rawUrl = annotations[RADAR_CHART_KPI_URL_ANNOTATION];
  if (!rawUrl) {
    return null;
  }

  const kpiUrl = rawUrl.trim();
  try {
    // eslint-disable-next-line no-new
    new URL(kpiUrl);
  } catch {
    throw new AnnotationParseError(
      `${RADAR_CHART_KPI_URL_ANNOTATION} must be a valid absolute URL (got "${rawUrl}")`,
    );
  }

  const title = annotations[RADAR_CHART_TITLE_ANNOTATION];
  const showAuthorStr = annotations[RADAR_CHART_SHOW_AUTHOR_ANNOTATION];
  const showAuthor = showAuthorStr !== 'false';

  return { kpiUrl, title, showAuthor };
}

export function validateKpisPayload(payload: unknown): Record<string, number> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AnnotationParseError(
      `KPI payload must be a JSON object mapping name to number (1..100)`,
    );
  }

  const kpis: Record<string, number> = {};
  for (const [name, value] of Object.entries(payload as Record<string, unknown>)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 1 || value > 100) {
      throw new AnnotationParseError(
        `KPI '${name}' has invalid value ${String(value)}. Must be a number 1..100.`,
      );
    }
    kpis[name] = value;
  }

  for (const lockedName of LOCKED_KPI_NAMES) {
    if (!(lockedName in kpis)) {
      kpis[lockedName] = DEFAULT_KPI_VALUE;
    }
  }

  return kpis;
}
