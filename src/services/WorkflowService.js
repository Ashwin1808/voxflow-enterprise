import { request } from "../api/apiClient.js";

export class WorkflowService {
  static async getWorkflowDefinitions() {
    return [
      { id: "fraud_verification:1.0", name: "fraud_verification", version: "1.0" },
      { id: "premium_collection:1.0", name: "premium_collection", version: "1.0" }
    ];
  }

  static async getWorkflowExecution(sessionId) {
    return request("fraud", `/api/v1/fraud/workflows/sessions/${sessionId}`).catch(() => null);
  }
}
