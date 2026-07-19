import { request } from "../api/apiClient.js";

export class CampaignService {
  static async getFraudCampaigns() {
    return request("fraud", "/api/v1/fraud/campaigns");
  }

  static async createFraudCampaign(campaignData) {
    return request("fraud", "/api/v1/fraud/campaigns", {
      method: "POST",
      body: JSON.stringify(campaignData)
    });
  }

  static async getInsuranceCampaigns() {
    return request("insurance", "/api/v1/insurance/campaigns");
  }

  static async createInsuranceCampaign(campaignData) {
    return request("insurance", "/api/v1/insurance/campaigns", {
      method: "POST",
      body: JSON.stringify(campaignData)
    });
  }

  static async addContact(serviceType, campaignId, contactData) {
    const service = serviceType.toLowerCase();
    return request(service, `/api/v1/${service}/campaigns/${campaignId}/contacts`, {
      method: "POST",
      body: JSON.stringify(contactData)
    });
  }

  static async startCampaign(serviceType, campaignId) {
    const service = serviceType.toLowerCase();
    return request(service, `/api/v1/${service}/campaigns/${campaignId}/start`, { method: "POST" });
  }

  static async pauseCampaign(serviceType, campaignId) {
    const service = serviceType.toLowerCase();
    return request(service, `/api/v1/${service}/campaigns/${campaignId}/pause`, { method: "POST" });
  }
}
