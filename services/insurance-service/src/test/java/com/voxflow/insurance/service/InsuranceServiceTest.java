package com.voxflow.insurance.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.voxflow.insurance.dto.InsuranceCampaignRequest;
import com.voxflow.insurance.dto.PolicyContactRequest;
import com.voxflow.insurance.dto.PolicyStatus;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class InsuranceServiceTest {

    private final InsuranceService insuranceService = new InsuranceService();

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
