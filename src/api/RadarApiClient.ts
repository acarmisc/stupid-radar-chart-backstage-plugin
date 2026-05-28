import { ConfigApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { RadarApi } from './RadarApi';
import { GenerateRequest, SavedChart, ChartConfig } from './types';
import { getBaseUrl } from '../config';

export class RadarApiClient implements RadarApi {
  private baseUrl: string;

  constructor(config: ConfigApi) {
    this.baseUrl = getBaseUrl(config);
  }

  async generatePng(req: GenerateRequest): Promise<Blob> {
    const { title, author, deliverableType, kpis, showAuthor } = req;
    const response = await fetch(`${this.baseUrl}/api/generate-radar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    const response = await fetch(`${this.baseUrl}/api/charts?out=picture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    // We read the blob to consume the response, but we don't need to use it
    // since we just need the slug from the headers
    await response.blob();
    const slug = response.headers.get('X-Chart-Slug');

    if (!slug) {
      throw new Error('No chart slug returned from server');
    }

    return {
      slug,
      url: `${this.baseUrl}/s/${slug}`,
    };
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
