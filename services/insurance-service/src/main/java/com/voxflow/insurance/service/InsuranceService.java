package com.voxflow.insurance.service;

import com.voxflow.insurance.dto.CampaignMetrics;
import com.voxflow.insurance.dto.CampaignStatus;
import com.voxflow.insurance.dto.InsuranceCampaignRequest;
import com.voxflow.insurance.dto.InsuranceCampaignResponse;
import com.voxflow.insurance.dto.PolicyContactRequest;
import com.voxflow.insurance.dto.PolicyResponse;
import com.voxflow.insurance.dto.PolicyStatus;
import com.voxflow.workflow.execution.ExecutionContext;
import com.voxflow.workflow.service.WorkflowExecutor;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class InsuranceService {
    private final Map<UUID, InsuranceCampaignResponse> campaigns = new ConcurrentHashMap<>();
    private final Map<UUID, PolicyResponse> policies = new ConcurrentHashMap<>();
    private final WorkflowExecutor workflowExecutor;

    public InsuranceService(WorkflowExecutor workflowExecutor) {
        this.workflowExecutor = workflowExecutor;
    }

    public InsuranceCampaignResponse createCampaign(InsuranceCampaignRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        InsuranceCampaignResponse campaign = new InsuranceCampaignResponse(UUID.randomUUID(), request.name(), request.workflowName(), CampaignStatus.DRAFT, 0, List.of(), now, now);
        campaigns.put(campaign.id(), campaign);
        return campaign;
    }

    public InsuranceCampaignResponse addPolicy(UUID campaignId, PolicyContactRequest request) {
        InsuranceCampaignResponse campaign = getCampaign(campaignId);
        PolicyResponse policy = new PolicyResponse(UUID.randomUUID(), request.customerPhone(), request.policyNumber(), request.premiumDue(), PolicyStatus.RENEWAL_DUE, null, null, OffsetDateTime.now());
        policies.put(policy.id(), policy);
        List<PolicyResponse> updatedPolicies = new ArrayList<>(campaign.policies());
        updatedPolicies.add(policy);
        InsuranceCampaignResponse updated = new InsuranceCampaignResponse(campaign.id(), campaign.name(), campaign.workflowName(), CampaignStatus.READY, updatedPolicies.size(), List.copyOf(updatedPolicies), campaign.createdAt(), OffsetDateTime.now());
        campaigns.put(campaignId, updated);
        return updated;
    }

    public PolicyResponse initiatePayment(UUID policyId) {
        PolicyResponse policy = getPolicy(policyId);
        PolicyResponse updated = new PolicyResponse(policy.id(), policy.customerPhone(), policy.policyNumber(), policy.premiumDue(), PolicyStatus.PAYMENT_INITIATED, "/visual-ivr/insurance/payment/" + policyId, policy.claimsUrl(), OffsetDateTime.now());
        policies.put(policyId, updated);
        
        // Start payment workflow if available
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("policyNumber", policy.policyNumber());
            variables.put("premiumDue", policy.premiumDue());
            variables.put("customerPhone", policy.customerPhone());
            
            ExecutionContext workflowContext = workflowExecutor.startWorkflow("policy_payment:1.0", variables);
            // Link workflow session with policy for tracking
        } catch (Exception e) {
            // Log but don't fail - workflow is optional
        }
        
        refreshCampaignPolicy(updated);
        return updated;
    }

    public PolicyResponse sendClaimsLink(UUID policyId) {
        PolicyResponse policy = getPolicy(policyId);
        PolicyResponse updated = new PolicyResponse(policy.id(), policy.customerPhone(), policy.policyNumber(), policy.premiumDue(), PolicyStatus.CLAIMS_LINK_SENT, policy.paymentUrl(), "/visual-ivr/insurance/claims/" + policyId, OffsetDateTime.now());
        policies.put(policyId, updated);
        refreshCampaignPolicy(updated);
        return updated;
    }

    public InsuranceCampaignResponse getCampaign(UUID campaignId) {
        InsuranceCampaignResponse campaign = campaigns.get(campaignId);
        if (campaign == null) {
            throw new IllegalArgumentException("Insurance campaign not found: " + campaignId);
        }
        return campaign;
    }

    private PolicyResponse getPolicy(UUID policyId) {
        PolicyResponse policy = policies.get(policyId);
        if (policy == null) {
            throw new IllegalArgumentException("Policy not found: " + policyId);
        }
        return policy;
    }

    private void refreshCampaignPolicy(PolicyResponse updatedPolicy) {
        campaigns.replaceAll((id, campaign) -> {
            List<PolicyResponse> refreshed = campaign.policies().stream()
                    .map(policy -> policy.id().equals(updatedPolicy.id()) ? updatedPolicy : policy)
                    .toList();
            return new InsuranceCampaignResponse(campaign.id(), campaign.name(), campaign.workflowName(), campaign.status(), refreshed.size(), refreshed, campaign.createdAt(), OffsetDateTime.now());
        });
    }

    public List<InsuranceCampaignResponse> listCampaigns() {
        return new ArrayList<>(campaigns.values());
    }

    public InsuranceCampaignResponse startCampaign(UUID campaignId) {
        InsuranceCampaignResponse campaign = getCampaign(campaignId);
        if (campaign.totalPolicies() == 0) {
            throw new IllegalStateException("Insurance campaign must have policies before start");
        }
        InsuranceCampaignResponse updated = new InsuranceCampaignResponse(
                campaign.id(), campaign.name(), campaign.workflowName(), CampaignStatus.RUNNING,
                campaign.totalPolicies(), campaign.policies(), campaign.createdAt(), OffsetDateTime.now());
        campaigns.put(campaignId, updated);
        return updated;
    }

    public InsuranceCampaignResponse pauseCampaign(UUID campaignId) {
        InsuranceCampaignResponse campaign = getCampaign(campaignId);
        if (campaign.status() != CampaignStatus.RUNNING) {
            throw new IllegalStateException("Insurance campaign must be RUNNING to pause");
        }
        InsuranceCampaignResponse updated = new InsuranceCampaignResponse(
                campaign.id(), campaign.name(), campaign.workflowName(), CampaignStatus.PAUSED,
                campaign.totalPolicies(), campaign.policies(), campaign.createdAt(), OffsetDateTime.now());
        campaigns.put(campaignId, updated);
        return updated;
    }

    public InsuranceCampaignResponse resumeCampaign(UUID campaignId) {
        InsuranceCampaignResponse campaign = getCampaign(campaignId);
        if (campaign.status() != CampaignStatus.PAUSED) {
            throw new IllegalStateException("Insurance campaign must be PAUSED to resume");
        }
        InsuranceCampaignResponse updated = new InsuranceCampaignResponse(
                campaign.id(), campaign.name(), campaign.workflowName(), CampaignStatus.RUNNING,
                campaign.totalPolicies(), campaign.policies(), campaign.createdAt(), OffsetDateTime.now());
        campaigns.put(campaignId, updated);
        return updated;
    }

    public CampaignMetrics getCampaignMetrics(UUID campaignId) {
        InsuranceCampaignResponse campaign = getCampaign(campaignId);
        long total = campaign.totalPolicies();
        long paymentInitiated = campaign.policies().stream()
                .filter(p -> p.status() == PolicyStatus.PAYMENT_INITIATED)
                .count();
        long claimsLinkSent = campaign.policies().stream()
                .filter(p -> p.status() == PolicyStatus.CLAIMS_LINK_SENT)
                .count();
        double completionRate = total > 0 ? (double) (paymentInitiated + claimsLinkSent) / total : 0.0;
        return new CampaignMetrics(total, paymentInitiated, claimsLinkSent, completionRate);
    }
}
