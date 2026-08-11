package com.voxflow.fraud.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.voxflow.fraud.domain.FraudCampaign;
import com.voxflow.fraud.domain.FraudSession;
import com.voxflow.fraud.domain.VisualIvrToken;
import com.voxflow.fraud.dto.CampaignStatus;
import com.voxflow.fraud.dto.FraudCampaignRequest;
import com.voxflow.fraud.dto.FraudContactRequest;
import com.voxflow.fraud.dto.FraudDecision;
import com.voxflow.fraud.dto.FraudDecisionRequest;
import com.voxflow.fraud.dto.FraudStatus;
import com.voxflow.fraud.dto.VisualIvrPublicDecision;
import com.voxflow.fraud.repository.FraudCampaignRepository;
import com.voxflow.fraud.repository.FraudSessionRepository;
import com.voxflow.fraud.repository.VisualIvrTokenRepository;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

class PublicVisualIvrServiceTest {

    private final FraudCampaignRepository campaignRepository = Mockito.mock(FraudCampaignRepository.class);
    private final FraudSessionRepository sessionRepository = Mockito.mock(FraudSessionRepository.class);
    private final VisualIvrTokenRepository tokenRepository = Mockito.mock(VisualIvrTokenRepository.class);
    private final com.voxflow.workflow.service.WorkflowExecutor workflowExecutor = Mockito.mock(com.voxflow.workflow.service.WorkflowExecutor.class);
    private final com.voxflow.workflow.event.EventPublisher eventPublisher = Mockito.mock(com.voxflow.workflow.event.EventPublisher.class);

    private final VisualIvrTokenService tokenService = new VisualIvrTokenService(tokenRepository);
    private final FraudService fraudService = new FraudService(campaignRepository, sessionRepository, workflowExecutor, eventPublisher, tokenService);

    private final Map<String, VisualIvrToken> tokenDb = new HashMap<>();
    private final Map<UUID, FraudSession> sessionDb = new HashMap<>();

    private FraudSession session;

    @BeforeEach
    void setUp() {
        tokenDb.clear();
        sessionDb.clear();

        Mockito.when(tokenRepository.save(Mockito.any(VisualIvrToken.class)))
                .thenAnswer(invocation -> {
                    VisualIvrToken token = invocation.getArgument(0);
                    tokenDb.put(token.getToken(), token);
                    return token;
                });
        Mockito.when(tokenRepository.findByToken(Mockito.anyString()))
                .thenAnswer(invocation -> Optional.ofNullable(tokenDb.get(invocation.getArgument(0))));
        Mockito.when(tokenRepository.expireActiveTokensForSession(Mockito.any(UUID.class))).thenReturn(0);

        Mockito.when(sessionRepository.findById(Mockito.any(UUID.class)))
                .thenAnswer(invocation -> Optional.ofNullable(sessionDb.get(invocation.getArgument(0))));
        Mockito.when(sessionRepository.save(Mockito.any(FraudSession.class)))
                .thenAnswer(invocation -> {
                    FraudSession s = invocation.getArgument(0);
                    sessionDb.put(s.getId(), s);
                    return s;
                });

        FraudCampaign campaign = new FraudCampaign(
                UUID.randomUUID(), "Visual IVR test", "fraud_verification:2.0",
                CampaignStatus.READY, 1, null, java.util.List.of(),
                java.time.OffsetDateTime.now(), java.time.OffsetDateTime.now());
        session = new FraudSession(
                UUID.randomUUID(), campaign, "+919900009999", "9999",
                "Online Store", BigDecimal.valueOf(25000),
                FraudStatus.PENDING, "ACTIVE", null,
                java.time.OffsetDateTime.now(), java.time.OffsetDateTime.now());
        sessionDb.put(session.getId(), session);
    }

    private String issueToken() {
        return tokenService.createForSession(session.getId()).getToken();
    }

    @Test
    void resolvesTokenToSessionSummaryWithMaskedPhone() {
        String token = issueToken();

        var summary = fraudService.resolveVisualIvr(token);

        assertThat(summary.merchant()).isEqualTo("Online Store");
        assertThat(summary.amount()).isEqualByComparingTo(BigDecimal.valueOf(25000));
        assertThat(summary.cardLastFour()).isEqualTo("9999");
        assertThat(summary.maskedPhone()).doesNotContain("9900");
        assertThat(summary.maskedPhone()).endsWith("99");
        assertThat(summary.sessionStatus()).isEqualTo("PENDING");
    }

    @Test
    void approvesTransactionThroughVisualIvr() {
        String token = issueToken();

        var response = fraudService.decideVisualIvr(token, VisualIvrPublicDecision.APPROVE);

        assertThat(response.outcome()).isEqualTo("APPROVED");
        assertThat(sessionDb.get(session.getId()).getStatus()).isEqualTo(FraudStatus.APPROVED);
        assertThat(sessionDb.get(session.getId()).getCardStatus()).isEqualTo("ACTIVE");

        ArgumentCaptor<com.voxflow.workflow.event.dto.WorkflowCompletedEvent> captor =
                ArgumentCaptor.forClass(com.voxflow.workflow.event.dto.WorkflowCompletedEvent.class);
        Mockito.verify(eventPublisher).publish(Mockito.eq("workflow.completed"), captor.capture());
        assertThat(captor.getValue().finalStatus()).isEqualTo("APPROVED");
    }

    @Test
    void declinesTransactionAndBlocksCard() {
        String token = issueToken();

        var response = fraudService.decideVisualIvr(token, VisualIvrPublicDecision.DECLINE);

        assertThat(response.outcome()).isEqualTo("DECLINED");
        assertThat(sessionDb.get(session.getId()).getStatus()).isEqualTo(FraudStatus.BLOCKED);
        assertThat(sessionDb.get(session.getId()).getCardStatus()).isEqualTo("BLOCKED");
    }

    @Test
    void rejectsDecisionOnAlreadyUsedToken() {
        String token = issueToken();
        fraudService.decideVisualIvr(token, VisualIvrPublicDecision.APPROVE);

        assertThatThrownBy(() -> fraudService.decideVisualIvr(token, VisualIvrPublicDecision.DECLINE))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already been used");
        assertThat(sessionDb.get(session.getId()).getStatus()).isEqualTo(FraudStatus.APPROVED);
    }

    @Test
    void rejectsResolutionOfUnknownToken() {
        assertThatThrownBy(() -> fraudService.resolveVisualIvr("bogus"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("invalid");
    }
}
