import { GenerateRequest, SavedChart, ChartConfig } from './types';
export interface RadarApi {
    generatePng(req: GenerateRequest): Promise<Blob>;
    saveChart(config: ChartConfig): Promise<{
        slug: string;
        url: string;
    }>;
    getChart(slug: string): Promise<SavedChart>;
}
export declare const radarApiRef: import("@backstage/core-plugin-api").ApiRef<RadarApi>;
//# sourceMappingURL=RadarApi.d.ts.map