import { request } from "../api/apiClient.js";

export class FraudService {
  static async getSessions() {
    return request("fraud", "/api/v1/fraud/sessions");
  }

  static async getSession(id) {
    return request("fraud", `/api/v1/fraud/sessions/${id}`);
  }

  static async submitDecision(id, decisionData) {
    return request("fraud", `/api/v1/fraud/sessions/${id}/decision`, {
      method: "POST",
      body: JSON.stringify(decisionData)
    });
  }
}
