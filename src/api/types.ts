export interface ChartConfig {
  title: string;
  author: string;
  deliverableType: string;
  showAuthor: boolean;
  extraKpi: { name: string; value: number } | null;
  lockedValues: Record<string, number>;
}

export interface GenerateRequest {
  title?: string;
  author?: string;
  deliverableType?: string;
  kpis: Record<string, number>;
  showAuthor?: boolean;
}

export interface SavedChart {
  slug: string;
  title: string;
  author: string;
  deliverableType: string;
  showAuthor: boolean;
  lockedValues: Record<string, number>;
  extraKpi: { name: string; value: number } | null;
  createdAt: string;
}
