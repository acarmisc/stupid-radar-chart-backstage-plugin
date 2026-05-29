import { Entity } from '@backstage/catalog-model';
import {
  parseRadarAnnotations,
  validateKpisPayload,
  entityHasRadarChartAnnotation,
  AnnotationParseError,
  RADAR_CHART_KPI_URL_ANNOTATION,
  RADAR_CHART_TITLE_ANNOTATION,
  RADAR_CHART_SHOW_AUTHOR_ANNOTATION,
} from './annotations';

const createEntity = (annotations: Record<string, string> = {}): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component',
    namespace: 'default',
    annotations,
  },
});

describe('parseRadarAnnotations', () => {
  it('returns null when kpi-url annotation is missing', () => {
    expect(parseRadarAnnotations(createEntity())).toBeNull();
  });

  it('extracts a valid absolute kpi-url', () => {
    const entity = createEntity({
      [RADAR_CHART_KPI_URL_ANNOTATION]: 'https://example.test/kpis.json',
    });
    expect(parseRadarAnnotations(entity)).toEqual({
      kpiUrl: 'https://example.test/kpis.json',
      showAuthor: true,
    });
  });

  it('trims surrounding whitespace from kpi-url', () => {
    const entity = createEntity({
      [RADAR_CHART_KPI_URL_ANNOTATION]: '  https://example.test/k  ',
    });
    expect(parseRadarAnnotations(entity)?.kpiUrl).toBe('https://example.test/k');
  });

  it('throws on invalid URL', () => {
    const entity = createEntity({
      [RADAR_CHART_KPI_URL_ANNOTATION]: 'not a url',
    });
    expect(() => parseRadarAnnotations(entity)).toThrow(AnnotationParseError);
    expect(() => parseRadarAnnotations(entity)).toThrow(/valid absolute URL/);
  });

  it('parses optional title annotation', () => {
    const entity = createEntity({
      [RADAR_CHART_KPI_URL_ANNOTATION]: 'https://example.test/k',
      [RADAR_CHART_TITLE_ANNOTATION]: 'My Custom Title',
    });
    expect(parseRadarAnnotations(entity)?.title).toBe('My Custom Title');
  });

  it('honors show-author = "false"', () => {
    const entity = createEntity({
      [RADAR_CHART_KPI_URL_ANNOTATION]: 'https://example.test/k',
      [RADAR_CHART_SHOW_AUTHOR_ANNOTATION]: 'false',
    });
    expect(parseRadarAnnotations(entity)?.showAuthor).toBe(false);
  });

  it('defaults show-author to true', () => {
    const entity = createEntity({
      [RADAR_CHART_KPI_URL_ANNOTATION]: 'https://example.test/k',
    });
    expect(parseRadarAnnotations(entity)?.showAuthor).toBe(true);
  });
});

describe('entityHasRadarChartAnnotation', () => {
  it('returns true when kpi-url annotation is present', () => {
    expect(
      entityHasRadarChartAnnotation(
        createEntity({ [RADAR_CHART_KPI_URL_ANNOTATION]: 'https://example.test/k' }),
      ),
    ).toBe(true);
  });

  it('returns false when annotation is missing', () => {
    expect(entityHasRadarChartAnnotation(createEntity())).toBe(false);
  });
});

describe('validateKpisPayload', () => {
  it('accepts valid KPI object and fills missing locked KPIs to 50', () => {
    expect(validateKpisPayload({ author: 80 })).toEqual({
      author: 80,
      ai: 50,
      team: 50,
      research: 50,
      unspecified: 50,
    });
  });

  it('preserves custom KPI keys (forward-compat)', () => {
    const out = validateKpisPayload({ author: 80, customKpi: 75 });
    expect(out.customKpi).toBe(75);
  });

  it('throws on non-object payload', () => {
    expect(() => validateKpisPayload(null)).toThrow(AnnotationParseError);
    expect(() => validateKpisPayload(['x'])).toThrow(AnnotationParseError);
    expect(() => validateKpisPayload('string')).toThrow(AnnotationParseError);
  });

  it('throws on out-of-range value', () => {
    expect(() => validateKpisPayload({ author: 150 })).toThrow(/invalid value/);
    expect(() => validateKpisPayload({ author: 0 })).toThrow(/invalid value/);
  });

  it('throws on non-numeric value', () => {
    expect(() => validateKpisPayload({ author: 'eighty' })).toThrow(/invalid value/);
  });
});
