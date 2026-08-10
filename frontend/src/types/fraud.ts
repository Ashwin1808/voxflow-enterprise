export type CampaignStatus = "DRAFT" | "READY" | "RUNNING" | "PAUSED" | "COMPLETED";

export type FraudStatus =
  | "PENDING"
  | "QUEUED"
  | "DIALING"
  | "RINGING"
  | "ANSWERED"
  | "APPROVED"
  | "BLOCKED"
  | "VISUAL_IVR_SENT";

export type FraudDecision = "APPROVE" | "BLOCK" | "SEND_VISUAL_IVR";

export interface ApiEnvelope<T> {
  status: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface FraudSession {
  id: string;
  customerPhone: string;
  cardLastFour: string;
  merchant: string;
  amount: number;
  status: FraudStatus;
  cardStatus: string;
  visualIvrUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FraudCampaign {
  id: string;
  name: string;
  workflowName: string;
  status: CampaignStatus;
  totalContacts: number;
  contacts: FraudSession[];
  createdAt: string;
  updatedAt: string;
}

export interface FraudCampaignInput {
  name: string;
  workflowName: string;
}

export interface FraudContactInput {
  customerPhone: string;
  cardLastFour: string;
  merchant: string;
  amount: number;
}

export interface CampaignMetrics {
  totalContacts: number;
  completed: number;
  failed: number;
  retryRate: number;
}

export type CampaignCommand = "start" | "pause" | "resume";

export interface FraudSessionInput {
  customerPhone: string;
  cardLastFour: string;
  merchant: string;
  amount: number;
}
