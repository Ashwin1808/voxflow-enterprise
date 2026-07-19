import { request } from "../api/apiClient.js";

export class InboundService {
  static async createSession(callData) {
    return request("inbound", "/api/v1/inbound/calls", {
      method: "POST",
      body: JSON.stringify(callData)
    });
  }

  static async handleDtmf(sessionId, dtmfDigit) {
    return request("inbound", `/api/v1/inbound/calls/${sessionId}/dtmf`, {
      method: "POST",
      body: JSON.stringify({ digit: dtmfDigit })
    });
  }
}
