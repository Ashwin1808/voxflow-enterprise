import apiClient from "../apiClient";
import type {
  CampaignCommand,
  CampaignMetrics,
  FraudCampaign,
  FraudCampaignInput,
  FraudContactInput,
  FraudDecision,
  FraudSession,
  FraudStatus,
} from "../../types/fraud";

const BASE = "/api/v1/fraud";

export async function listFraudCampaigns(): Promise<FraudCampaign[]> {
  const { data } = await apiClient.get<FraudCampaign[]>(`${BASE}/campaigns`);
  return data;
}

export async function getFraudCampaign(id: string): Promise<FraudCampaign> {
  const { data } = await apiClient.get<FraudCampaign>(`${BASE}/campaigns/${id}`);
  return data;
}

export async function createFraudCampaign(input: FraudCampaignInput): Promise<FraudCampaign> {
  const { data } = await apiClient.post<FraudCampaign>(`${BASE}/campaigns`, input);
  return data;
}

export async function uploadFraudContacts(
  campaignId: string,
  contacts: FraudContactInput[]
): Promise<FraudCampaign> {
  const { data } = await apiClient.post<FraudCampaign>(
    `${BASE}/campaigns/${campaignId}/contacts/bulk`,
    contacts
  );
  return data;
}

export async function sendCampaignCommand(
  campaignId: string,
  command: CampaignCommand
): Promise<FraudCampaign> {
  const { data } = await apiClient.post<FraudCampaign>(
    `${BASE}/campaigns/${campaignId}/${command}`
  );
  return data;
}

export async function getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
  const { data } = await apiClient.get<CampaignMetrics>(`${BASE}/campaigns/${campaignId}/metrics`);
  return data;
}

export async function recordSessionDecision(
  sessionId: string,
  decision: FraudDecision
): Promise<FraudSession> {
  const { data } = await apiClient.post<FraudSession>(
    `${BASE}/sessions/${sessionId}/decision`,
    { decision }
  );
  return data;
}

export async function transitionSession(
  sessionId: string,
  status: FraudStatus
): Promise<FraudSession> {
  const { data } = await apiClient.post<FraudSession>(
    `${BASE}/sessions/${sessionId}/transition`,
    { status }
  );
  return data;
}

export async function getFraudSession(sessionId: string): Promise<FraudSession> {
  const { data } = await apiClient.get<FraudSession>(`${BASE}/sessions/${sessionId}`);
  return data;
}
