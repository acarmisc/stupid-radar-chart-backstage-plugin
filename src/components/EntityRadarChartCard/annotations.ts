import { Entity } from '@backstage/catalog-model';

export const RADAR_CHART_KPI_ANNOTATION = 'radar-chart/kpis';
export const RADAR_CHART_TITLE_ANNOTATION = 'radar-chart/title';
export const RADAR_CHART_SHOW_AUTHOR_ANNOTATION = 'radar-chart/show-author';

const LOCKED_KPI_NAMES = ['author', 'ai', 'team', 'research', 'unspecified'];
const DEFAULT_KPI_VALUE = 50;

export interface RadarAnnotationData {
  kpis: Record<string, number>;
  title?: string;
  showAuthor: boolean;
}

export class AnnotationParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnnotationParseError';
  }
}

export function parseRadarAnnotations(entity: Entity): RadarAnnotationData | null {
  const annotations = entity.metadata.annotations || {};

  // Check if the required KPI annotation is present
  const kpisJson = annotations[RADAR_CHART_KPI_ANNOTATION];
  if (!kpisJson) {
    return null;
  }

  // Parse JSON
  let kpis: Record<string, number>;
  try {
    kpis = JSON.parse(kpisJson);
  } catch (e) {
    throw new AnnotationParseError(`Failed to parse ${RADAR_CHART_KPI_ANNOTATION}: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (!kpis || typeof kpis !== 'object' || Array.isArray(kpis)) {
    throw new AnnotationParseError(`${RADAR_CHART_KPI_ANNOTATION} must be a JSON object`);
  }

  // Validate KPI values
  for (const [name, value] of Object.entries(kpis)) {
    if (typeof value !== 'number' || value < 1 || value > 100) {
      throw new AnnotationParseError(`KPI '${name}' has invalid value ${value}. Must be 1-100.`);
    }
  }

  // Fill in missing locked KPIs with default value
  for (const lockedName of LOCKED_KPI_NAMES) {
    if (!(lockedName in kpis)) {
      kpis[lockedName] = DEFAULT_KPI_VALUE;
    }
  }

  // Parse optional title annotation
  const title = annotations[RADAR_CHART_TITLE_ANNOTATION];

  // Parse optional show-author annotation
  const showAuthorStr = annotations[RADAR_CHART_SHOW_AUTHOR_ANNOTATION];
  const showAuthor = showAuthorStr !== 'false'; // Default to true if not set

  return {
    kpis,
    title,
    showAuthor,
  };
}

export function entityHasRadarChartAnnotation(entity: Entity): boolean {
  const annotations = entity.metadata.annotations || {};
  return RADAR_CHART_KPI_ANNOTATION in annotations;
}
