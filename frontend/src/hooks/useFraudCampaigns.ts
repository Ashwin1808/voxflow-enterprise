import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFraudCampaign,
  createFraudSession,
  getCampaignMetrics,
  listFraudCampaigns,
  recordSessionDecision,
  sendCampaignCommand,
  transitionSession,
  uploadFraudContacts,
} from "../api/fraud/fraudCampaignApi";
import type {
  CampaignCommand,
  FraudCampaignInput,
  FraudContactInput,
  FraudDecision,
  FraudSessionInput,
  FraudStatus,
} from "../types/fraud";

export const fraudKeys = {
  all: ["fraud", "campaigns"] as const,
  list: () => [...fraudKeys.all, "list"] as const,
  detail: (id: string) => [...fraudKeys.all, "detail", id] as const,
  metrics: (id: string) => [...fraudKeys.all, "metrics", id] as const,
};

export function useFraudCampaigns() {
  return useQuery({
    queryKey: fraudKeys.list(),
    queryFn: listFraudCampaigns,
    refetchInterval: 15_000,
  });
}

export function useCampaignMetrics(campaignId: string) {
  return useQuery({
    queryKey: fraudKeys.metrics(campaignId),
    queryFn: () => getCampaignMetrics(campaignId),
    enabled: Boolean(campaignId),
    refetchInterval: 15_000,
  });
}

export function useCreateFraudCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FraudCampaignInput) => createFraudCampaign(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fraudKeys.list() }),
  });
}

export function useUploadFraudContacts(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contacts: FraudContactInput[]) => uploadFraudContacts(campaignId, contacts),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: fraudKeys.list() });
      queryClient.setQueryData(fraudKeys.detail(campaign.id), campaign);
    },
  });
}

export function useCampaignCommand(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: CampaignCommand) => sendCampaignCommand(campaignId, command),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: fraudKeys.list() });
      queryClient.setQueryData(fraudKeys.detail(campaign.id), campaign);
    },
  });
}

export function useSessionDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, decision }: { sessionId: string; decision: FraudDecision }) =>
      recordSessionDecision(sessionId, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fraudKeys.list() });
    },
  });
}

export function useCreateFraudSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FraudSessionInput) => createFraudSession(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fraudKeys.list() });
    },
  });
}

export function useTransitionSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: string; status: FraudStatus }) =>
      transitionSession(sessionId, status),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: fraudKeys.list() });
      queryClient.setQueryData(fraudKeys.detail(session.id), session);
    },
  });
}
