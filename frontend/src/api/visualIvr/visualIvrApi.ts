import { publicClient } from "./publicClient";
import type {
  VisualIvrDecisionResponse,
  VisualIvrPublicDecision,
  VisualIvrSummary,
} from "../../types/visualIvr";

const BASE = "/public/visual-ivr";

export async function getVisualIvrSummary(token: string): Promise<VisualIvrSummary> {
  const { data } = await publicClient.get<VisualIvrSummary>(`${BASE}/${token}`);
  return data;
}

export async function submitVisualIvrDecision(
  token: string,
  decision: VisualIvrPublicDecision
): Promise<VisualIvrDecisionResponse> {
  const { data } = await publicClient.post<VisualIvrDecisionResponse>(
    `${BASE}/${token}/decision`,
    { decision }
  );
  return data;
}
