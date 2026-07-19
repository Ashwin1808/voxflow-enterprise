import { request } from "../api/apiClient.js";

export class ProviderService {
  static async getProviders() {
    return request("fraud", "/api/v1/providers").catch(() => []);
  }
}
