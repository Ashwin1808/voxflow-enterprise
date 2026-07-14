package com.voxflow.fraud.service;

import com.voxflow.fraud.dto.CampaignMetrics;
import com.voxflow.fraud.dto.CampaignStatus;
import com.voxflow.fraud.dto.FraudDecision;
import com.voxflow.fraud.dto.FraudDecisionRequest;
import com.voxflow.fraud.dto.FraudCampaignRequest;
import com.voxflow.fraud.dto.FraudCampaignResponse;
import com.voxflow.fraud.dto.FraudContactRequest;
import com.voxflow.fraud.dto.FraudSessionRequest;
import com.voxflow.fraud.dto.FraudSessionResponse;
import com.voxflow.fraud.dto.FraudStatus;
import com.voxflow.workflow.execution.ExecutionContext;
import com.voxflow.workflow.service.WorkflowExecutor;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class FraudService {

    private final Map<UUID, FraudSessionResponse> sessions = new ConcurrentHashMap<>();
    private final Map<UUID, FraudCampaignResponse> campaigns = new ConcurrentHashMap<>();
    private final WorkflowExecutor workflowExecutor;

    public FraudService(WorkflowExecutor workflowExecutor) {
        this.workflowExecutor = workflowExecutor;
    }

    public FraudCampaignResponse createCampaign(FraudCampaignRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        FraudCampaignResponse campaign = new FraudCampaignResponse(
                UUID.randomUUID(),
                request.name(),
                request.workflowName(),
                CampaignStatus.DRAFT,
                0,
                java.util.List.of(),
                now,
                now);
        campaigns.put(campaign.id(), campaign);
        return campaign;
    }

    public FraudCampaignResponse addContact(UUID campaignId, FraudContactRequest request) {
        FraudCampaignResponse campaign = getCampaign(campaignId);
        FraudSessionResponse session = createSession(new FraudSessionRequest(
                request.customerPhone(),
                request.cardLastFour(),
                request.merchant(),
                request.amount()));
        java.util.List<FraudSessionResponse> contacts = new java.util.ArrayList<>(campaign.contacts());
        contacts.add(session);
        FraudCampaignResponse updated = new FraudCampaignResponse(
                campaign.id(), campaign.name(), campaign.workflowName(), CampaignStatus.READY,
                contacts.size(), java.util.List.copyOf(contacts), campaign.createdAt(), OffsetDateTime.now());
        campaigns.put(campaignId, updated);
        return updated;
    }

    public FraudCampaignResponse startCampaign(UUID campaignId) {
        FraudCampaignResponse campaign = getCampaign(campaignId);
        if (campaign.totalContacts() == 0) {
            throw new IllegalStateException("Fraud campaign must have contacts before start");
        }
        FraudCampaignResponse updated = new FraudCampaignResponse(
                campaign.id(), campaign.name(), campaign.workflowName(), CampaignStatus.RUNNING,
                campaign.totalContacts(), campaign.contacts(), campaign.createdAt(), OffsetDateTime.now());
        campaigns.put(campaignId, updated);
        return updated;
    }

    public FraudCampaignResponse pauseCampaign(UUID campaignId) {
        FraudCampaignResponse campaign = getCampaign(campaignId);
        if (campaign.status() != CampaignStatus.RUNNING) {
            throw new IllegalStateException("Fraud campaign must be RUNNING to pause");
        }
        FraudCampaignResponse updated = new FraudCampaignResponse(
                campaign.id(), campaign.name(), campaign.workflowName(), CampaignStatus.PAUSED,
                campaign.totalContacts(), campaign.contacts(), campaign.createdAt(), OffsetDateTime.now());
        campaigns.put(campaignId, updated);
        return updated;
    }

    public FraudCampaignResponse resumeCampaign(UUID campaignId) {
        FraudCampaignResponse campaign = getCampaign(campaignId);
        if (campaign.status() != CampaignStatus.PAUSED) {
            throw new IllegalStateException("Fraud campaign must be PAUSED to resume");
        }
        FraudCampaignResponse updated = new FraudCampaignResponse(
                campaign.id(), campaign.name(), campaign.workflowName(), CampaignStatus.RUNNING,
                campaign.totalContacts(), campaign.contacts(), campaign.createdAt(), OffsetDateTime.now());
        campaigns.put(campaignId, updated);
        return updated;
    }

    public FraudCampaignResponse getCampaign(UUID id) {
        FraudCampaignResponse campaign = campaigns.get(id);
        if (campaign == null) {
            throw new IllegalArgumentException("Fraud campaign not found: " + id);
        }
        return campaign;
    }

    public java.util.List<FraudCampaignResponse> listCampaigns() {
        return new java.util.ArrayList<>(campaigns.values());
    }

    public CampaignMetrics getCampaignMetrics(UUID campaignId) {
        FraudCampaignResponse campaign = getCampaign(campaignId);
        long total = campaign.totalContacts();
        long completed = campaign.contacts().stream()
                .filter(c -> c.status() == FraudStatus.APPROVED || c.status() == FraudStatus.BLOCKED)
                .count();
        long failed = campaign.contacts().stream()
                .filter(c -> c.status() == FraudStatus.VISUAL_IVR_SENT)
                .count();
        double retryRate = total > 0 ? (double) failed / total : 0.0;
        return new CampaignMetrics(total, completed, failed, retryRate);
    }

    public FraudSessionResponse createSession(FraudSessionRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        FraudSessionResponse response = new FraudSessionResponse(
                UUID.randomUUID(),
                request.customerPhone(),
                request.cardLastFour(),
                request.merchant(),
                request.amount(),
                FraudStatus.PENDING,
                "ACTIVE",
                null,
                now,
                now);
        sessions.put(response.id(), response);
        
        // Start workflow if workflow name is provided
        if (request.workflowName() != null && !request.workflowName().isEmpty()) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("customerPhone", request.customerPhone());
            variables.put("cardLastFour", request.cardLastFour());
            variables.put("merchant", request.merchant());
            variables.put("amount", request.amount());
            
            try {
                ExecutionContext workflowContext = workflowExecutor.startWorkflow(request.workflowName(), variables);
                // Store workflow session ID in fraud session
                // This would be extended to link workflow session with fraud session
            } catch (Exception e) {
                // Log but don't fail - workflow is optional
            }
        }
        
        return response;
    }

    public FraudSessionResponse decide(UUID id, FraudDecisionRequest request) {
        FraudSessionResponse current = getSession(id);
        FraudStatus status = switch (request.decision()) {
            case APPROVE -> FraudStatus.APPROVED;
            case BLOCK -> FraudStatus.BLOCKED;
            case SEND_VISUAL_IVR -> FraudStatus.VISUAL_IVR_SENT;
        };
        String cardStatus = request.decision() == FraudDecision.BLOCK ? "BLOCKED" : current.cardStatus();
        String visualUrl = request.decision() == FraudDecision.SEND_VISUAL_IVR ? "/visual-ivr/fraud/" + id : current.visualIvrUrl();
        FraudSessionResponse updated = new FraudSessionResponse(
                current.id(), current.customerPhone(), current.cardLastFour(), current.merchant(), current.amount(),
                status, cardStatus, visualUrl, current.createdAt(), OffsetDateTime.now());
        sessions.put(id, updated);
        return updated;
    }

    public FraudSessionResponse getSession(UUID id) {
        FraudSessionResponse session = sessions.get(id);
        if (session == null) {
            throw new IllegalArgumentException("Fraud session not found: " + id);
        }
        return session;
    }
}
