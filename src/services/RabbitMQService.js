import { request } from "../api/apiClient.js";

export class RabbitMQService {
  static async getQueueStatus() {
    return request("fraud", "/api/v1/rabbitmq/queues").catch(() => []);
  }

  static async getExchangeStatus() {
    return request("fraud", "/api/v1/rabbitmq/exchanges").catch(() => null);
  }
}
