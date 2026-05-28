import { Entity } from '@backstage/catalog-model';
export declare const RADAR_CHART_KPI_ANNOTATION = "radar-chart/kpis";
export declare const RADAR_CHART_TITLE_ANNOTATION = "radar-chart/title";
export declare const RADAR_CHART_SHOW_AUTHOR_ANNOTATION = "radar-chart/show-author";
export interface RadarAnnotationData {
    kpis: Record<string, number>;
    title?: string;
    showAuthor: boolean;
}
export declare class AnnotationParseError extends Error {
    constructor(message: string);
}
export declare function parseRadarAnnotations(entity: Entity): RadarAnnotationData | null;
export declare function entityHasRadarChartAnnotation(entity: Entity): boolean;
//# sourceMappingURL=annotations.d.ts.map