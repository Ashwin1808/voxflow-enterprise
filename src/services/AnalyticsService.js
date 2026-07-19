import { request } from "../api/apiClient.js";

export class AnalyticsService {
  static async getMetrics() {
    return request("fraud", "/api/v1/analytics/metrics").catch(() => null);
  }
}
