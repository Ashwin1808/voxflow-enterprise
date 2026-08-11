import axios from "axios";

const BASE_URL = import.meta.env.VITE_OUTBOUND_BASE_URL ?? "http://localhost:8087/api/v1/outbound";

export interface OutboundConfig {
  provider: string;
}

export interface OutboundCall {
  id: string;
  phone: string;
  workflowName: string;
  provider: string;
  status: string;
  attempts: number;
  visualIvrUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const client = axios.create({ timeout: 20_000 });

client.interceptors.response.use(
  (response) => {
    const body = response.data as { data?: unknown; status?: string } | undefined;
    if (body && typeof body === "object" && "data" in body) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      return Promise.reject(new Error("Unauthorized — sign in as ADMIN"));
    }
    return Promise.reject(new Error(error.response?.data?.message ?? "Outbound request failed"));
  }
);

export async function getOutboundConfig(): Promise<OutboundConfig> {
  const { data } = await client.get<OutboundConfig>(`${BASE_URL}/config`);
  return data;
}

export async function listOutboundCalls(): Promise<OutboundCall[]> {
  const { data } = await client.get<OutboundCall[]>(`${BASE_URL}/calls`);
  return data;
}

export async function placeTestCall(phone: string): Promise<OutboundCall> {
  const { data } = await client.post<OutboundCall>(`${BASE_URL}/calls`, {
    phone,
    workflowName: "fraud_verification:2.0",
  });
  return data;
}