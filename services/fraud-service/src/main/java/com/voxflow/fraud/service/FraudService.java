package com.voxflow.fraud.service;

import com.voxflow.fraud.domain.FraudCampaign;
import com.voxflow.fraud.domain.FraudSession;
import com.voxflow.fraud.domain.VisualIvrToken;
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
import com.voxflow.fraud.dto.VisualIvrDecisionResponse;
import com.voxflow.fraud.dto.VisualIvrPublicDecision;
import com.voxflow.fraud.dto.VisualIvrSummary;
import com.voxflow.fraud.repository.FraudCampaignRepository;
import com.voxflow.fraud.repository.FraudSessionRepository;
import com.voxflow.workflow.event.EventPublisher;
import com.voxflow.workflow.event.dto.*;
import com.voxflow.workflow.service.WorkflowExecutor;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FraudService {

    private final FraudCampaignRepository campaignRepository;
    private final FraudSessionRepository sessionRepository;
    private final WorkflowExecutor workflowExecutor;
    private final EventPublisher eventPublisher;
    private final VisualIvrTokenService visualIvrTokenService;

    public FraudService(FraudCampaignRepository campaignRepository, FraudSessionRepository sessionRepository, WorkflowExecutor workflowExecutor, EventPublisher eventPublisher, VisualIvrTokenService visualIvrTokenService) {
        this.campaignRepository = campaignRepository;
        this.sessionRepository = sessionRepository;
        this.workflowExecutor = workflowExecutor;
        this.eventPublisher = eventPublisher;
        this.visualIvrTokenService = visualIvrTokenService;
    }

    public FraudCampaignResponse createCampaign(FraudCampaignRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        FraudCampaign campaign = new FraudCampaign(
                UUID.randomUUID(),
                request.name(),
                request.workflowName(),
                CampaignStatus.DRAFT,
                0,
                java.util.List.of(),
                now,
                now);
        campaignRepository.save(campaign);
        
        eventPublisher.publish("campaign.created", new CampaignEvent(
                campaign.getId(),
                campaign.getName(),
                campaign.getWorkflowName(),
                campaign.getStatus().name(),
                campaign.getTotalContacts(),
                now));
        
        return toCampaignResponse(campaign);
    }

    public FraudCampaignResponse addContact(UUID campaignId, FraudContactRequest request) {
        FraudCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Fraud campaign not found: " + campaignId));
        
        FraudSession session = new FraudSession(
                UUID.randomUUID(),
                campaign,
                request.customerPhone(),
                request.cardLastFour(),
                request.merchant(),
                request.amount(),
                FraudStatus.PENDING,
                "ACTIVE",
                null,
                OffsetDateTime.now(),
                OffsetDateTime.now());
        
        sessionRepository.save(session);
        
        campaign.getContacts().add(session);
        campaign.setTotalContacts(campaign.getContacts().size());
        campaign.setStatus(CampaignStatus.READY);
        campaign.setUpdatedAt(OffsetDateTime.now());
        campaignRepository.save(campaign);
        
        return toCampaignResponse(campaign);
    }

    public FraudCampaignResponse startCampaign(UUID campaignId) {
        FraudCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Fraud campaign not found: " + campaignId));
        if (campaign.getTotalContacts() == 0) {
            throw new IllegalStateException("Fraud campaign must have contacts before start");
        }
        campaign.setStatus(CampaignStatus.RUNNING);
        campaign.setUpdatedAt(OffsetDateTime.now());
        campaignRepository.save(campaign);
        
        eventPublisher.publish("campaign.started", new CampaignEvent(
                campaign.getId(),
                campaign.getName(),
                campaign.getWorkflowName(),
                "RUNNING",
                campaign.getTotalContacts(),
                OffsetDateTime.now()));

        if (campaign.getWorkflowName() != null && !campaign.getWorkflowName().isEmpty()) {
            for (FraudSession session : campaign.getContacts()) {
                if (session.getStatus() == FraudStatus.PENDING) {
                    Map<String, Object> variables = new HashMap<>();
                    variables.put("sessionId", session.getId().toString());
                    variables.put("customerPhone", session.getCustomerPhone());
                    variables.put("cardLastFour", session.getCardLastFour());
                    variables.put("merchant", session.getMerchant());
                    variables.put("amount", session.getAmount());
                    try {
                        workflowExecutor.startWorkflow(campaign.getWorkflowName(), variables);
                        session.setStatus(FraudStatus.QUEUED);
                    } catch (Exception e) {
                    }
                }
            }
            sessionRepository.saveAll(campaign.getContacts());
        }
                
        return toCampaignResponse(campaign);
    }

    public FraudCampaignResponse pauseCampaign(UUID campaignId) {
        FraudCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Fraud campaign not found: " + campaignId));
        if (campaign.getStatus() != CampaignStatus.RUNNING) {
            throw new IllegalStateException("Fraud campaign must be RUNNING to pause");
        }
        campaign.setStatus(CampaignStatus.PAUSED);
        campaign.setUpdatedAt(OffsetDateTime.now());
        campaignRepository.save(campaign);
        return toCampaignResponse(campaign);
    }

    public FraudCampaignResponse resumeCampaign(UUID campaignId) {
        FraudCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Fraud campaign not found: " + campaignId));
        if (campaign.getStatus() != CampaignStatus.PAUSED) {
            throw new IllegalStateException("Fraud campaign must be PAUSED to resume");
        }
        campaign.setStatus(CampaignStatus.RUNNING);
        campaign.setUpdatedAt(OffsetDateTime.now());
        campaignRepository.save(campaign);
        return toCampaignResponse(campaign);
    }

    public FraudCampaignResponse getCampaign(UUID id) {
        return campaignRepository.findById(id)
                .map(this::toCampaignResponse)
                .orElseThrow(() -> new IllegalArgumentException("Fraud campaign not found: " + id));
    }

    public java.util.List<FraudCampaignResponse> listCampaigns() {
        return campaignRepository.findAll().stream()
                .map(this::toCampaignResponse)
                .toList();
    }

    public CampaignMetrics getCampaignMetrics(UUID campaignId) {
        FraudCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Fraud campaign not found: " + campaignId));
        long total = campaign.getTotalContacts();
        long completed = campaign.getContacts().stream()
                .filter(c -> c.getStatus() == FraudStatus.APPROVED || c.getStatus() == FraudStatus.BLOCKED)
                .count();
        long failed = campaign.getContacts().stream()
                .filter(c -> c.getStatus() == FraudStatus.VISUAL_IVR_SENT)
                .count();
        double retryRate = total > 0 ? (double) failed / total : 0.0;
        return new CampaignMetrics(total, completed, failed, retryRate);
    }

    public FraudSessionResponse createSession(FraudSessionRequest request) {
        return createSession(request, null);
    }

    public FraudSessionResponse createSession(FraudSessionRequest request, String workflowName) {
        OffsetDateTime now = OffsetDateTime.now();
        FraudSession session = new FraudSession(
                UUID.randomUUID(),
                null,
                request.customerPhone(),
                request.cardLastFour(),
                request.merchant(),
                request.amount(),
                FraudStatus.PENDING,
                "ACTIVE",
                null,
                now,
                now);
        sessionRepository.save(session);
        return toSessionResponse(session);
    }

    public FraudSessionResponse decide(UUID id, FraudDecisionRequest request) {
        FraudSession current = sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fraud session not found: " + id));
        FraudStatus status = switch (request.decision()) {
            case APPROVE -> FraudStatus.APPROVED;
            case BLOCK -> FraudStatus.BLOCKED;
            case SEND_VISUAL_IVR -> FraudStatus.VISUAL_IVR_SENT;
        };
        String cardStatus = request.decision() == FraudDecision.BLOCK ? "BLOCKED" : current.getCardStatus();
        String visualUrl = current.getVisualIvrUrl();
        if (request.decision() == FraudDecision.SEND_VISUAL_IVR) {
            visualUrl = "/public/visual-ivr/" + visualIvrTokenService.createForSession(id).getToken();
        }
        
        current.setStatus(status);
        current.setCardStatus(cardStatus);
        current.setVisualIvrUrl(visualUrl);
        current.setUpdatedAt(OffsetDateTime.now());
        sessionRepository.save(current);
        
        if (status == FraudStatus.VISUAL_IVR_SENT) {
            eventPublisher.publish("visualivr.generated", new VisualIvrEvent(
                    id, current.getCustomerPhone(), "fraud_fallback", visualUrl, OffsetDateTime.now()));
        } else {
            eventPublisher.publish("workflow.completed", new WorkflowCompletedEvent(
                    id.toString(), "fraud_verification:2.0", status.name(), Map.of("cardStatus", cardStatus), OffsetDateTime.now()));
        }
        
        return toSessionResponse(current);
    }

    public FraudCampaignResponse addContactsBulk(UUID campaignId, java.util.List<FraudContactRequest> requests) {
        FraudCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Fraud campaign not found: " + campaignId));
        
        java.util.List<FraudSession> sessions = new java.util.ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now();
        for (FraudContactRequest request : requests) {
            FraudSession session = new FraudSession(
                    UUID.randomUUID(),
                    campaign,
                    request.customerPhone(),
                    request.cardLastFour(),
                    request.merchant(),
                    request.amount(),
                    FraudStatus.PENDING,
                    "ACTIVE",
                    null,
                    now,
                    now);
            sessions.add(session);
        }
        
        sessionRepository.saveAll(sessions);
        campaign.getContacts().addAll(sessions);
        campaign.setTotalContacts(campaign.getContacts().size());
        campaign.setStatus(CampaignStatus.READY);
        campaign.setUpdatedAt(now);
        campaignRepository.save(campaign);
        
        return toCampaignResponse(campaign);
    }

    public FraudSessionResponse transitionSession(UUID id, com.voxflow.fraud.dto.FraudTransitionRequest request) {
        FraudSession current = sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fraud session not found: " + id));
        current.setStatus(request.status());
        current.setUpdatedAt(OffsetDateTime.now());
        sessionRepository.save(current);

        eventPublisher.publish("call.status", new CallEvent(
                id, current.getCustomerPhone(), "fraud_verification", request.status().name(), null, OffsetDateTime.now()));
                
        return toSessionResponse(current);
    }

    public FraudSessionResponse getSession(UUID id) {
        return sessionRepository.findById(id)
                .map(this::toSessionResponse)
                .orElseThrow(() -> new IllegalArgumentException("Fraud session not found: " + id));
    }

    @Transactional(readOnly = true)
    public VisualIvrSummary resolveVisualIvr(String rawToken) {
        VisualIvrToken token = visualIvrTokenService.resolve(rawToken);
        FraudSession session = sessionRepository.findById(token.getSessionId())
                .orElseThrow(() -> new IllegalArgumentException("Fraud session not found"));
        return new VisualIvrSummary(
                session.getMerchant(),
                session.getAmount(),
                session.getCardLastFour(),
                maskPhone(session.getCustomerPhone()),
                session.getCreatedAt(),
                session.getStatus().name());
    }

    @Transactional
    public VisualIvrDecisionResponse decideVisualIvr(String rawToken, VisualIvrPublicDecision decision) {
        VisualIvrToken token = visualIvrTokenService.redeem(rawToken);
        FraudSession session = sessionRepository.findById(token.getSessionId())
                .orElseThrow(() -> new IllegalArgumentException("Fraud session not found"));

        String outcome;
        FraudStatus status;
        String cardStatus;
        switch (decision) {
            case APPROVE -> {
                outcome = "APPROVED";
                status = FraudStatus.APPROVED;
                cardStatus = session.getCardStatus();
            }
            case DECLINE -> {
                outcome = "DECLINED";
                status = FraudStatus.BLOCKED;
                cardStatus = "BLOCKED";
                session.setCardStatus(cardStatus);
            }
            default -> throw new IllegalArgumentException("Unsupported decision: " + decision);
        }

        session.setStatus(status);
        session.setUpdatedAt(OffsetDateTime.now());
        sessionRepository.save(session);

        eventPublisher.publish("workflow.completed", new WorkflowCompletedEvent(
                session.getId().toString(),
                "fraud_verification:2.0",
                status.name(),
                Map.of("cardStatus", cardStatus, "channel", "visual_ivr"),
                OffsetDateTime.now()));

        return new VisualIvrDecisionResponse(
                outcome,
                outcome.equals("APPROVED")
                        ? "Transaction confirmed. No further action needed."
                        : "Transaction declined. Your card has been blocked and a case has been raised.",
                status,
                cardStatus);
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) {
            return phone;
        }
        String suffix = phone.substring(phone.length() - 2);
        return "+" + "•".repeat(Math.max(0, phone.length() - 2)) + suffix;
    }

    @RabbitListener(queues = "payment.queue")
    public void handlePaymentEvent(PaymentEvent event) {
        System.out.println("Fraud service received payment event: " + event);
    }

    private FraudCampaignResponse toCampaignResponse(FraudCampaign campaign) {
        return new FraudCampaignResponse(
                campaign.getId(),
                campaign.getName(),
                campaign.getWorkflowName(),
                campaign.getStatus(),
                campaign.getTotalContacts(),
                campaign.getContacts().stream().map(this::toSessionResponse).toList(),
                campaign.getCreatedAt(),
                campaign.getUpdatedAt());
    }

    private FraudSessionResponse toSessionResponse(FraudSession session) {
        return new FraudSessionResponse(
                session.getId(),
                session.getCustomerPhone(),
                session.getCardLastFour(),
                session.getMerchant(),
                session.getAmount(),
                session.getStatus(),
                session.getCardStatus(),
                session.getVisualIvrUrl(),
                session.getCreatedAt(),
                session.getUpdatedAt());
    }
}
