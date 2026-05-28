export interface Config {
  radarChart?: {
    /**
     * Base URL of the stupid-radar-chart Cloud Run instance.
     * @visibility frontend
     */
    baseUrl?: string;
  };
}
