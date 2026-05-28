import { Entity } from '@backstage/catalog-model';
import {
  parseRadarAnnotations,
  entityHasRadarChartAnnotation,
  AnnotationParseError,
  RADAR_CHART_KPI_ANNOTATION,
  RADAR_CHART_TITLE_ANNOTATION,
  RADAR_CHART_SHOW_AUTHOR_ANNOTATION,
} from './annotations';

describe('EntityRadarChartCard annotations', () => {
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
    it('returns null when annotation is missing', () => {
      const entity = createEntity();
      expect(parseRadarAnnotations(entity)).toBeNull();
    });

    it('parses valid JSON with all locked KPIs', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: '{"author":80,"ai":40,"team":90,"research":55,"unspecified":30}',
      });
      const result = parseRadarAnnotations(entity);
      expect(result).toEqual({
        kpis: { author: 80, ai: 40, team: 90, research: 55, unspecified: 30 },
        showAuthor: true,
      });
    });

    it('defaults missing locked KPIs to 50', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: '{"author":80}',
      });
      const result = parseRadarAnnotations(entity);
      expect(result?.kpis).toEqual({
        author: 80,
        ai: 50,
        team: 50,
        research: 50,
        unspecified: 50,
      });
    });

    it('preserves custom KPI keys (forward-compat)', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: '{"author":80,"customKpi":75}',
      });
      const result = parseRadarAnnotations(entity);
      expect(result?.kpis.customKpi).toBe(75);
    });

    it('parses optional title annotation', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: '{"author":50}',
        [RADAR_CHART_TITLE_ANNOTATION]: 'My Custom Title',
      });
      const result = parseRadarAnnotations(entity);
      expect(result?.title).toBe('My Custom Title');
    });

    it('parses optional show-author annotation as true', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: '{"author":50}',
        [RADAR_CHART_SHOW_AUTHOR_ANNOTATION]: 'true',
      });
      const result = parseRadarAnnotations(entity);
      expect(result?.showAuthor).toBe(true);
    });

    it('parses optional show-author annotation as false', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: '{"author":50}',
        [RADAR_CHART_SHOW_AUTHOR_ANNOTATION]: 'false',
      });
      const result = parseRadarAnnotations(entity);
      expect(result?.showAuthor).toBe(false);
    });

    it('defaults show-author to true when not specified', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: '{"author":50}',
      });
      const result = parseRadarAnnotations(entity);
      expect(result?.showAuthor).toBe(true);
    });

    it('throws on malformed JSON', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: 'not json',
      });
      expect(() => parseRadarAnnotations(entity)).toThrow(AnnotationParseError);
      expect(() => parseRadarAnnotations(entity)).toThrow(/Failed to parse/);
    });

    it('throws on non-object JSON', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: '["array"]',
      });
      expect(() => parseRadarAnnotations(entity)).toThrow(AnnotationParseError);
      expect(() => parseRadarAnnotations(entity)).toThrow(/must be a JSON object/);
    });

    it('throws on out-of-range KPI value', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: '{"author":150}',
      });
      expect(() => parseRadarAnnotations(entity)).toThrow(AnnotationParseError);
      expect(() => parseRadarAnnotations(entity)).toThrow(/invalid value/);
    });

    it('throws on KPI value below 1', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: '{"author":0}',
      });
      expect(() => parseRadarAnnotations(entity)).toThrow(AnnotationParseError);
    });

    it('throws on non-numeric KPI value', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: '{"author":"eighty"}',
      });
      expect(() => parseRadarAnnotations(entity)).toThrow(AnnotationParseError);
    });
  });

  describe('entityHasRadarChartAnnotation', () => {
    it('returns true when annotation is present', () => {
      const entity = createEntity({
        [RADAR_CHART_KPI_ANNOTATION]: '{"author":50}',
      });
      expect(entityHasRadarChartAnnotation(entity)).toBe(true);
    });

    it('returns false when annotation is missing', () => {
      const entity = createEntity();
      expect(entityHasRadarChartAnnotation(entity)).toBe(false);
    });
  });
});
