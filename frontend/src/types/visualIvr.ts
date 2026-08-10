export type VisualIvrSummary = {
  merchant: string;
  amount: number;
  cardLastFour: string;
  maskedPhone: string;
  transactionTime: string;
  sessionStatus: string;
};

export type VisualIvrPublicDecision = "APPROVE" | "DECLINE";

export type VisualIvrDecisionResponse = {
  outcome: string;
  message: string;
  sessionStatus: string;
  cardStatus: string;
};
