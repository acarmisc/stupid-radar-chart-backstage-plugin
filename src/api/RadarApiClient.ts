import { ConfigApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { RadarApi } from './RadarApi';
import { GenerateRequest, SavedChart, ChartConfig } from './types';
import { getBaseUrl, getApiKey } from '../config';

export class RadarApiClient implements RadarApi {
  private baseUrl: string;
  private apiKey: string | undefined;

  constructor(config: ConfigApi) {
    this.baseUrl = getBaseUrl(config);
    this.apiKey = getApiKey(config);
  }

  private authHeaders(): HeadersInit {
    return this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {};
  }

  async generatePng(req: GenerateRequest): Promise<Blob> {
    const { title, author, deliverableType, kpis, showAuthor } = req;
    const response = await fetch(`${this.baseUrl}/api/generate-radar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify({
        title,
        author,
        deliverable_type: deliverableType,
        kpis,
        show_author: showAuthor,
      }),
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.blob();
  }

  async saveChart(config: ChartConfig): Promise<{ slug: string; url: string }> {
    const { title, author, deliverableType, showAuthor, lockedValues, extraKpi } = config;

    const response = await fetch(`${this.baseUrl}/api/charts?out=url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify({
        title,
        author,
        deliverable_type: deliverableType,
        show_author: showAuthor,
        locked_values: lockedValues,
        extra_kpi: extraKpi,
      }),
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    const data = await response.json();
    return { slug: data.slug, url: data.url };
  }

  async getChart(slug: string): Promise<SavedChart> {
    const response = await fetch(`${this.baseUrl}/api/charts/${slug}`);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    const data = await response.json();

    return {
      slug: data.slug,
      title: data.title,
      author: data.author,
      deliverableType: data.deliverableType,
      showAuthor: data.showAuthor,
      lockedValues: data.lockedValues,
      extraKpi: data.extraKpi,
      createdAt: data.createdAt,
    };
  }
}
