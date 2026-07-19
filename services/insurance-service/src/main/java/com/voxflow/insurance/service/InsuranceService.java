package com.voxflow.insurance.service;

import com.voxflow.insurance.domain.InsuranceCampaign;
import com.voxflow.insurance.domain.InsurancePolicy;
import com.voxflow.insurance.dto.CampaignMetrics;
import com.voxflow.insurance.dto.CampaignStatus;
import com.voxflow.insurance.dto.InsuranceCampaignRequest;
import com.voxflow.insurance.dto.InsuranceCampaignResponse;
import com.voxflow.insurance.dto.PolicyContactRequest;
import com.voxflow.insurance.dto.PolicyResponse;
import com.voxflow.insurance.dto.PolicyStatus;
import com.voxflow.insurance.repository.InsuranceCampaignRepository;
import com.voxflow.insurance.repository.InsurancePolicyRepository;
import com.voxflow.workflow.event.EventPublisher;
import com.voxflow.workflow.event.dto.*;
import com.voxflow.workflow.execution.ExecutionContext;
import com.voxflow.workflow.service.WorkflowExecutor;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InsuranceService {
    
    private final InsuranceCampaignRepository campaignRepository;
    private final InsurancePolicyRepository policyRepository;
    private final WorkflowExecutor workflowExecutor;
    private final EventPublisher eventPublisher;

    public InsuranceService(InsuranceCampaignRepository campaignRepository, InsurancePolicyRepository policyRepository, WorkflowExecutor workflowExecutor, EventPublisher eventPublisher) {
        this.campaignRepository = campaignRepository;
        this.policyRepository = policyRepository;
        this.workflowExecutor = workflowExecutor;
        this.eventPublisher = eventPublisher;
    }

    public InsuranceCampaignResponse createCampaign(InsuranceCampaignRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        InsuranceCampaign campaign = new InsuranceCampaign(
                UUID.randomUUID(),
                request.name(),
                request.workflowName(),
                CampaignStatus.DRAFT,
                0,
                List.of(),
                now,
                now);
        campaignRepository.save(campaign);
        
        eventPublisher.publish("campaign.created", new CampaignEvent(
                campaign.getId(),
                campaign.getName(),
                campaign.getWorkflowName(),
                "DRAFT",
                campaign.getTotalPolicies(),
                now));
                
        return toCampaignResponse(campaign);
    }

    public InsuranceCampaignResponse addPolicy(UUID campaignId, PolicyContactRequest request) {
        InsuranceCampaign campaign = getCampaignEntity(campaignId);
        
        InsurancePolicy policy = new InsurancePolicy(
                UUID.randomUUID(),
                campaign,
                request.customerPhone(),
                request.policyNumber(),
                request.premiumDue(),
                PolicyStatus.RENEWAL_DUE,
                null,
                null,
                OffsetDateTime.now(),
                OffsetDateTime.now());
        policyRepository.save(policy);
        
        campaign.getPolicies().add(policy);
        campaign.setTotalPolicies(campaign.getPolicies().size());
        campaign.setStatus(CampaignStatus.READY);
        campaign.setUpdatedAt(OffsetDateTime.now());
        campaignRepository.save(campaign);
        
        return toCampaignResponse(campaign);
    }

    public PolicyResponse initiatePayment(UUID policyId) {
        InsurancePolicy policy = getPolicyEntity(policyId);
        policy.setStatus(PolicyStatus.PAYMENT_INITIATED);
        policy.setPaymentUrl("/visual-ivr/insurance/payment/" + policyId);
        policy.setUpdatedAt(OffsetDateTime.now());
        policyRepository.save(policy);
        
        eventPublisher.publish("payment.requested", new PaymentEvent(
                UUID.randomUUID(),
                policyId,
                policy.getPremiumDue(),
                "INR",
                "INITIATED",
                null,
                null,
                OffsetDateTime.now()));
        
        // Start payment workflow if available
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("policyNumber", policy.getPolicyNumber());
            variables.put("premiumDue", policy.getPremiumDue());
            variables.put("customerPhone", policy.getCustomerPhone());
            
            workflowExecutor.startWorkflow("policy_payment:1.0", variables);
        } catch (Exception e) {
            // Log but don't fail - workflow is optional
        }
        
        return toPolicyResponse(policy);
    }

    public PolicyResponse sendClaimsLink(UUID policyId) {
        InsurancePolicy policy = getPolicyEntity(policyId);
        policy.setStatus(PolicyStatus.CLAIMS_LINK_SENT);
        policy.setClaimsUrl("/visual-ivr/insurance/claims/" + policyId);
        policy.setUpdatedAt(OffsetDateTime.now());
        policyRepository.save(policy);
        return toPolicyResponse(policy);
    }

    public InsuranceCampaignResponse getCampaign(UUID campaignId) {
        return toCampaignResponse(getCampaignEntity(campaignId));
    }

    private InsuranceCampaign getCampaignEntity(UUID campaignId) {
        return campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Insurance campaign not found: " + campaignId));
    }

    private InsurancePolicy getPolicyEntity(UUID policyId) {
        return policyRepository.findById(policyId)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found: " + policyId));
    }

    public List<InsuranceCampaignResponse> listCampaigns() {
        return campaignRepository.findAll().stream()
                .map(this::toCampaignResponse)
                .toList();
    }

    public InsuranceCampaignResponse startCampaign(UUID campaignId) {
        InsuranceCampaign campaign = getCampaignEntity(campaignId);
        if (campaign.getTotalPolicies() == 0) {
            throw new IllegalStateException("Insurance campaign must have policies before start");
        }
        campaign.setStatus(CampaignStatus.RUNNING);
        campaign.setUpdatedAt(OffsetDateTime.now());
        campaignRepository.save(campaign);
        
        eventPublisher.publish("campaign.started", new CampaignEvent(
                campaign.getId(),
                campaign.getName(),
                campaign.getWorkflowName(),
                "RUNNING",
                campaign.getTotalPolicies(),
                OffsetDateTime.now()));
                
        return toCampaignResponse(campaign);
    }

    public InsuranceCampaignResponse pauseCampaign(UUID campaignId) {
        InsuranceCampaign campaign = getCampaignEntity(campaignId);
        if (campaign.getStatus() != CampaignStatus.RUNNING) {
            throw new IllegalStateException("Insurance campaign must be RUNNING to pause");
        }
        campaign.setStatus(CampaignStatus.PAUSED);
        campaign.setUpdatedAt(OffsetDateTime.now());
        campaignRepository.save(campaign);
        return toCampaignResponse(campaign);
    }

    public InsuranceCampaignResponse resumeCampaign(UUID campaignId) {
        InsuranceCampaign campaign = getCampaignEntity(campaignId);
        if (campaign.getStatus() != CampaignStatus.PAUSED) {
            throw new IllegalStateException("Insurance campaign must be PAUSED to resume");
        }
        campaign.setStatus(CampaignStatus.RUNNING);
        campaign.setUpdatedAt(OffsetDateTime.now());
        campaignRepository.save(campaign);
        return toCampaignResponse(campaign);
    }

    public CampaignMetrics getCampaignMetrics(UUID campaignId) {
        InsuranceCampaign campaign = getCampaignEntity(campaignId);
        long total = campaign.getTotalPolicies();
        long paymentInitiated = campaign.getPolicies().stream()
                .filter(p -> p.getStatus() == PolicyStatus.PAYMENT_INITIATED)
                .count();
        long claimsLinkSent = campaign.getPolicies().stream()
                .filter(p -> p.getStatus() == PolicyStatus.CLAIMS_LINK_SENT)
                .count();
        double completionRate = total > 0 ? (double) (paymentInitiated + claimsLinkSent) / total : 0.0;
        return new CampaignMetrics(total, paymentInitiated, claimsLinkSent, completionRate);
    }

    @RabbitListener(queues = "campaign.queue")
    public void handleCampaignEvent(CampaignEvent event) {
        System.out.println("Insurance service received campaign event: " + event);
    }

    private InsuranceCampaignResponse toCampaignResponse(InsuranceCampaign campaign) {
        return new InsuranceCampaignResponse(
                campaign.getId(),
                campaign.getName(),
                campaign.getWorkflowName(),
                campaign.getStatus(),
                campaign.getTotalPolicies(),
                campaign.getPolicies().stream().map(this::toPolicyResponse).toList(),
                campaign.getCreatedAt(),
                campaign.getUpdatedAt());
    }

    private PolicyResponse toPolicyResponse(InsurancePolicy policy) {
        return new PolicyResponse(
                policy.getId(),
                policy.getCustomerPhone(),
                policy.getPolicyNumber(),
                policy.getPremiumDue(),
                policy.getStatus(),
                policy.getPaymentUrl(),
                policy.getClaimsUrl(),
                policy.getCreatedAt());
    }
}
