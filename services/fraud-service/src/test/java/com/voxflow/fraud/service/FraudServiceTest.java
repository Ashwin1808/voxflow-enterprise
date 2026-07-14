package com.voxflow.fraud.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.voxflow.fraud.dto.CampaignStatus;
import com.voxflow.fraud.dto.FraudCampaignRequest;
import com.voxflow.fraud.dto.FraudContactRequest;
import com.voxflow.fraud.dto.FraudDecision;
import com.voxflow.fraud.dto.FraudDecisionRequest;
import com.voxflow.fraud.dto.FraudStatus;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class FraudServiceTest {

    private final FraudService fraudService = new FraudService();

    @Test
    void createsCampaignAddsContactAndStartsCampaign() {
        var campaign = fraudService.createCampaign(new FraudCampaignRequest("Blocked card checks", "fraud-default"));

        assertThat(campaign.status()).isEqualTo(CampaignStatus.DRAFT);
        assertThat(campaign.totalContacts()).isZero();

        var updated = fraudService.addContact(campaign.id(), new FraudContactRequest(
                "+919900001111",
                "4242",
                "Travel Portal",
                BigDecimal.valueOf(8500)));

        assertThat(updated.status()).isEqualTo(CampaignStatus.READY);
        assertThat(updated.totalContacts()).isEqualTo(1);
        assertThat(updated.contacts()).hasSize(1);

        var running = fraudService.startCampaign(campaign.id());

        assertThat(running.status()).isEqualTo(CampaignStatus.RUNNING);
        assertThat(running.totalContacts()).isEqualTo(1);
    }

    @Test
    void rejectsStartingCampaignWithoutContacts() {
        var campaign = fraudService.createCampaign(new FraudCampaignRequest("Empty campaign", "fraud-default"));

        assertThatThrownBy(() -> fraudService.startCampaign(campaign.id()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("must have contacts");
    }

    @Test
    void recordsFraudDecisionAndVisualIvrFallback() {
        var campaign = fraudService.createCampaign(new FraudCampaignRequest("High risk transactions", "fraud-default"));
        var updated = fraudService.addContact(campaign.id(), new FraudContactRequest(
                "+919900002222",
                "1111",
                "Electronics Store",
                BigDecimal.valueOf(42000)));
        var session = updated.contacts().getFirst();

        var decided = fraudService.decide(session.id(), new FraudDecisionRequest(FraudDecision.SEND_VISUAL_IVR));

        assertThat(decided.status()).isEqualTo(FraudStatus.VISUAL_IVR_SENT);
        assertThat(decided.visualIvrUrl()).isEqualTo("/visual-ivr/fraud/" + session.id());
    }
}
