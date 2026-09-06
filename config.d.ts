export interface Config {
  radarChart?: {
    /**
     * Base URL of the upstream radar chart service.
     * Required: the plugin throws at runtime if this is missing.
     * @visibility frontend
     */
    baseUrl: string;
    /**
     * Bearer token for the radar chart service API.
     * @visibility frontend
     */
    apiKey?: string;
  };
}
