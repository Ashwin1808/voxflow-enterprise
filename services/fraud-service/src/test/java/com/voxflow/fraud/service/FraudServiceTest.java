package com.voxflow.fraud.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.voxflow.fraud.dto.CampaignStatus;
import com.voxflow.fraud.dto.FraudCampaignRequest;
import com.voxflow.fraud.dto.FraudContactRequest;
import com.voxflow.fraud.dto.FraudDecision;
import com.voxflow.fraud.dto.FraudDecisionRequest;
import com.voxflow.fraud.dto.FraudStatus;
import com.voxflow.fraud.repository.FraudCampaignRepository;
import com.voxflow.fraud.repository.FraudSessionRepository;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FraudServiceTest {

    private final FraudCampaignRepository campaignRepository = org.mockito.Mockito.mock(FraudCampaignRepository.class);
    private final FraudSessionRepository sessionRepository = org.mockito.Mockito.mock(FraudSessionRepository.class);
    private final com.voxflow.workflow.service.WorkflowExecutor workflowExecutor = org.mockito.Mockito.mock(com.voxflow.workflow.service.WorkflowExecutor.class);
    private final com.voxflow.workflow.event.EventPublisher eventPublisher = org.mockito.Mockito.mock(com.voxflow.workflow.event.EventPublisher.class);
    private final VisualIvrTokenService visualIvrTokenService = org.mockito.Mockito.mock(VisualIvrTokenService.class);
    private final FraudService fraudService = new FraudService(campaignRepository, sessionRepository, workflowExecutor, eventPublisher, visualIvrTokenService);

    private final Map<UUID, com.voxflow.fraud.domain.FraudCampaign> campaignDb = new HashMap<>();
    private final Map<UUID, com.voxflow.fraud.domain.FraudSession> sessionDb = new HashMap<>();

    @BeforeEach
    void setUp() {
        campaignDb.clear();
        sessionDb.clear();

        org.mockito.Mockito.when(campaignRepository.save(org.mockito.Mockito.any(com.voxflow.fraud.domain.FraudCampaign.class)))
                .thenAnswer(invocation -> {
                    com.voxflow.fraud.domain.FraudCampaign c = invocation.getArgument(0);
                    campaignDb.put(c.getId(), c);
                    return c;
                });
        org.mockito.Mockito.when(campaignRepository.findById(org.mockito.Mockito.any(UUID.class)))
                .thenAnswer(invocation -> Optional.ofNullable(campaignDb.get(invocation.getArgument(0))));

        org.mockito.Mockito.when(sessionRepository.save(org.mockito.Mockito.any(com.voxflow.fraud.domain.FraudSession.class)))
                .thenAnswer(invocation -> {
                    com.voxflow.fraud.domain.FraudSession s = invocation.getArgument(0);
                    sessionDb.put(s.getId(), s);
                    return s;
                });
        org.mockito.Mockito.when(sessionRepository.findById(org.mockito.Mockito.any(UUID.class)))
                .thenAnswer(invocation -> Optional.ofNullable(sessionDb.get(invocation.getArgument(0))));
    }

    @Test
    void createsCampaignAddsContactAndStartsCampaign() {
        var campaign = fraudService.createCampaign(new FraudCampaignRequest("Blocked card checks", "fraud-default", null));

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
        var campaign = fraudService.createCampaign(new FraudCampaignRequest("Empty campaign", "fraud-default", null));

        assertThatThrownBy(() -> fraudService.startCampaign(campaign.id()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("must have contacts");
    }

    @Test
    void recordsFraudDecisionAndVisualIvrFallback() {
        var campaign = fraudService.createCampaign(new FraudCampaignRequest("High risk transactions", "fraud-default", null));
        var updated = fraudService.addContact(campaign.id(), new FraudContactRequest(
                "+919900002222",
                "1111",
                "Electronics Store",
                BigDecimal.valueOf(42000)));
        var session = updated.contacts().getFirst();

        var token = new com.voxflow.fraud.domain.VisualIvrToken(
                UUID.randomUUID(), session.id(), "abc-123-token",
                com.voxflow.fraud.domain.VisualIvrToken.TokenStatus.ACTIVE,
                java.time.OffsetDateTime.now().plusHours(1),
                java.time.OffsetDateTime.now(), null);
        org.mockito.Mockito.when(visualIvrTokenService.createForSession(session.id())).thenReturn(token);

        var decided = fraudService.decide(session.id(), new FraudDecisionRequest(FraudDecision.SEND_VISUAL_IVR));

        assertThat(decided.status()).isEqualTo(FraudStatus.VISUAL_IVR_SENT);
        assertThat(decided.visualIvrUrl()).isEqualTo("/public/visual-ivr/abc-123-token");
        org.mockito.Mockito.verify(visualIvrTokenService).createForSession(session.id());
    }
}
