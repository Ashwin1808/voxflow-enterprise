import { request } from "../api/apiClient.js";

export class InsuranceService {
  static async initiatePayment(policyId) {
    return request("insurance", `/api/v1/insurance/policies/${policyId}/pay`, {
      method: "POST"
    });
  }

  static async sendClaimsLink(policyId) {
    return request("insurance", `/api/v1/insurance/policies/${policyId}/claims`, {
      method: "POST"
    });
  }
}
