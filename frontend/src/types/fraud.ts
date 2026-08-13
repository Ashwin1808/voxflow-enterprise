export type CampaignStatus = "DRAFT" | "READY" | "RUNNING" | "PAUSED" | "COMPLETED";

export type FraudStatus =
  | "PENDING"
  | "QUEUED"
  | "DIALING"
  | "RINGING"
  | "ANSWERED"
  | "APPROVED"
  | "BLOCKED"
  | "VISUAL_IVR_SENT"
  | "NO_ANSWER";

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
  visualOtp: string | null;
  visualIvrActivity: VisualIvrActivityEntry[] | null;
}

export interface VisualIvrActivityEntry {
  event: string;
  createdAt: string;
}

export interface FraudCampaign {
  id: string;
  name: string;
  workflowName: string;
  status: CampaignStatus;
  totalContacts: number;
  contacts: FraudSession[];
  scheduledStartAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FraudCampaignInput {
  name: string;
  workflowName: string;
  scheduledStartAt?: string | null;
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
