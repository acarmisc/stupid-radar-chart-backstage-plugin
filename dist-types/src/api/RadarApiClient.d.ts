import { ConfigApi } from '@backstage/core-plugin-api';
import { RadarApi } from './RadarApi';
import { GenerateRequest, SavedChart, ChartConfig } from './types';
export declare class RadarApiClient implements RadarApi {
    private baseUrl;
    constructor(config: ConfigApi);
    generatePng(req: GenerateRequest): Promise<Blob>;
    saveChart(config: ChartConfig): Promise<{
        slug: string;
        url: string;
    }>;
    getChart(slug: string): Promise<SavedChart>;
}
//# sourceMappingURL=RadarApiClient.d.ts.map