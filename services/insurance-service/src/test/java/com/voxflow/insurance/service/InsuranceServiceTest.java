package com.voxflow.insurance.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.voxflow.insurance.dto.InsuranceCampaignRequest;
import com.voxflow.insurance.dto.PolicyContactRequest;
import com.voxflow.insurance.dto.PolicyStatus;
import com.voxflow.insurance.repository.InsuranceCampaignRepository;
import com.voxflow.insurance.repository.InsurancePolicyRepository;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class InsuranceServiceTest {

    private final InsuranceCampaignRepository campaignRepository = org.mockito.Mockito.mock(InsuranceCampaignRepository.class);
    private final InsurancePolicyRepository policyRepository = org.mockito.Mockito.mock(InsurancePolicyRepository.class);
    private final com.voxflow.workflow.service.WorkflowExecutor workflowExecutor = org.mockito.Mockito.mock(com.voxflow.workflow.service.WorkflowExecutor.class);
    private final com.voxflow.workflow.event.EventPublisher eventPublisher = org.mockito.Mockito.mock(com.voxflow.workflow.event.EventPublisher.class);
    private final InsuranceService insuranceService = new InsuranceService(campaignRepository, policyRepository, workflowExecutor, eventPublisher);

    private final Map<UUID, com.voxflow.insurance.domain.InsuranceCampaign> campaignDb = new HashMap<>();
    private final Map<UUID, com.voxflow.insurance.domain.InsurancePolicy> policyDb = new HashMap<>();

    @BeforeEach
    void setUp() {
        campaignDb.clear();
        policyDb.clear();

        org.mockito.Mockito.when(campaignRepository.save(org.mockito.Mockito.any(com.voxflow.insurance.domain.InsuranceCampaign.class)))
                .thenAnswer(invocation -> {
                    com.voxflow.insurance.domain.InsuranceCampaign c = invocation.getArgument(0);
                    campaignDb.put(c.getId(), c);
                    return c;
                });
        org.mockito.Mockito.when(campaignRepository.findById(org.mockito.Mockito.any(UUID.class)))
                .thenAnswer(invocation -> Optional.ofNullable(campaignDb.get(invocation.getArgument(0))));

        org.mockito.Mockito.when(policyRepository.save(org.mockito.Mockito.any(com.voxflow.insurance.domain.InsurancePolicy.class)))
                .thenAnswer(invocation -> {
                    com.voxflow.insurance.domain.InsurancePolicy p = invocation.getArgument(0);
                    policyDb.put(p.getId(), p);
                    return p;
                });
        org.mockito.Mockito.when(policyRepository.findById(org.mockito.Mockito.any(UUID.class)))
                .thenAnswer(invocation -> Optional.ofNullable(policyDb.get(invocation.getArgument(0))));
    }

    @Test
    void createsCampaignAndAddsPolicyForRenewal() {
        var campaign = insuranceService.createCampaign(new InsuranceCampaignRequest("July renewals", "insurance-renewal"));

        assertThat(campaign.status()).isEqualTo("DRAFT");
        assertThat(campaign.totalPolicies()).isZero();

        var updated = insuranceService.addPolicy(campaign.id(), new PolicyContactRequest(
                "+918800001111",
                "POL-10001",
                BigDecimal.valueOf(12999)));

        assertThat(updated.status()).isEqualTo("READY");
        assertThat(updated.totalPolicies()).isEqualTo(1);
        assertThat(updated.policies()).hasSize(1);
        assertThat(updated.policies().getFirst().status()).isEqualTo(PolicyStatus.RENEWAL_DUE);
    }

    @Test
    void createsPaymentAndClaimsVisualIvrLinks() {
        var campaign = insuranceService.createCampaign(new InsuranceCampaignRequest("Renewal assistance", "insurance-renewal"));
        var updated = insuranceService.addPolicy(campaign.id(), new PolicyContactRequest(
                "+918800002222",
                "POL-20002",
                BigDecimal.valueOf(21999)));
        var policy = updated.policies().getFirst();

        var payment = insuranceService.initiatePayment(policy.id());
        assertThat(payment.status()).isEqualTo(PolicyStatus.PAYMENT_INITIATED);
        assertThat(payment.paymentUrl()).isEqualTo("/visual-ivr/insurance/payment/" + policy.id());

        var claims = insuranceService.sendClaimsLink(policy.id());
        assertThat(claims.status()).isEqualTo(PolicyStatus.CLAIMS_LINK_SENT);
        assertThat(claims.claimsUrl()).isEqualTo("/visual-ivr/insurance/claims/" + policy.id());
    }
}
